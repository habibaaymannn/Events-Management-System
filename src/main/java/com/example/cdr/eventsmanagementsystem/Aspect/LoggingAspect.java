package com.example.cdr.eventsmanagementsystem.Aspect;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("within(com.example.cdr.eventsmanagementsystem.Controller..*)")
    public void controllerLayer() {}

    @Pointcut("within(com.example.cdr.eventsmanagementsystem.Service..*)")
    public void serviceLayer() {}

    @Pointcut("within(com.example.cdr.eventsmanagementsystem.Repository..*)")
    public void repositoryLayer() {}

    private static String resolveLayer(String fqcn) { 
        if (fqcn.contains(".Controller.")) return "controller";
        if (fqcn.contains(".Repository.")) return "repository";
        if (fqcn.contains(".Service.")) return "service";
        return "app";
    }

    @Around("controllerLayer() || serviceLayer() || repositoryLayer()")
    public Object logAround(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature sig = (MethodSignature) pjp.getSignature(); 

        String shortSig = sig.getDeclaringType().getSimpleName() + "." + sig.getName() + "(" +
                Arrays.stream(sig.getParameterTypes()).map(Class::getSimpleName).collect(Collectors.joining(","))
                + ")"; 

        String layer = resolveLayer(sig.getDeclaringTypeName());

        long start = System.currentTimeMillis();
        log.info("ENTER layer={} method={}", layer, shortSig);
        if (log.isDebugEnabled()) {
            log.debug("args={}", getSafeArguments(sig, pjp.getArgs()));
        }

        try {
            Object result = pjp.proceed(); 
            long took = System.currentTimeMillis() - start; 
            String resultType = result != null ? result.getClass().getSimpleName() : "null";
            log.info("EXIT layer={} method={} durationMs={} resultType={}", layer, shortSig, took, resultType);
            return result;
        } catch (Throwable ex) {
            long took = System.currentTimeMillis() - start;
            log.error("ERROR layer={} method={} durationMs={} exType={} msg={}",
                    layer, shortSig, took, ex.getClass().getSimpleName(), ex.getMessage(), ex);
            throw ex;
        }
    }

    private String getSafeArguments(MethodSignature sig, Object[] args) {
        String[] paramNames = sig.getParameterNames();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < args.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(paramNames[i]).append("=");
            sb.append(getSafeValue(args[i]));
        }
        return sb.toString();
    }

    private String getSafeValue(Object value) {
        if (value == null) return "null";
        if (value instanceof String) return "\"" + value + "\"";
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        return "\"" + value.getClass().getSimpleName() + "\"";
    }
}
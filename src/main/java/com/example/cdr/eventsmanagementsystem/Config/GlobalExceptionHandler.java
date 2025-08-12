package com.example.cdr.eventsmanagementsystem.Config;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@Order(Ordered.HIGHEST_PRECEDENCE) // Ensure this runs before other exception handlers
@RestControllerAdvice 
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final int MAX_DETAIL_LEN = 500;

    // 400 – JSON/body and validation
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.BAD_REQUEST, req,
                "Unreadable request body", safeMessage(ex));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.BAD_REQUEST, req,
                "Validation failed", "One or more fields are invalid.");
        body.put("errors", ex.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldError).collect(Collectors.toList()));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, Object>> handleBind(BindException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.BAD_REQUEST, req,
                "Binding failed", "Request parameters/body are invalid.");
        body.put("errors", ex.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldError).collect(Collectors.toList()));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class) 
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.BAD_REQUEST, req,
                "Constraint violation", "One or more constraints were violated.");
        body.put("errors", ex.getConstraintViolations().stream()
                .map(this::toViolation).collect(Collectors.toList()));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.BAD_REQUEST, req,
                "Bad request", safeMessage(ex));
        return ResponseEntity.badRequest().body(body);
    }

    // 401 / 403 – security
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuth(AuthenticationException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.UNAUTHORIZED, req,
                "Unauthorized", "Authentication is required.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .header(HttpHeaders.WWW_AUTHENTICATE, "Bearer")
                .body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.FORBIDDEN, req,
                "Forbidden", "You do not have permission to access this resource.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // 404 – not found
    @ExceptionHandler({EntityNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<Map<String, Object>> handleNotFound(RuntimeException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.NOT_FOUND, req,
                "Not found", safeMessage(ex));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // 409 – conflicts
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(DataIntegrityViolationException ex, HttpServletRequest req) {
        Map<String, Object> body = base(HttpStatus.CONFLICT, req,
                "Conflict", "A data integrity violation occurred");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex, HttpServletRequest req) {
        HttpStatus status = mapUpstreamStatus(ex);
        Map<String, Object> body = base(status, req, upstreamTitle(status), upstreamDetail(ex, status));
        return ResponseEntity.status(status).body(body);
    }

    // Fallback – anything else
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAny(Exception ex, HttpServletRequest req) {
        HttpStatus status = resolveStatus(ex);
        boolean server = status.is5xxServerError();
        String errorId = server ? UUID.randomUUID().toString() : null;

        if (server) {
            log.error("errorId={} status={} endpoint={} -> {}", errorId, status.value(),
                    req.getMethod() + " " + req.getRequestURI(), ex.getMessage(), ex);
        } else {
            log.warn("status={} endpoint={} -> {}", status.value(),
                    req.getMethod() + " " + req.getRequestURI(), ex.getMessage());
        }

        Map<String, Object> body = base(status, req, status.getReasonPhrase(), detailFor(status, ex, errorId));
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(status);
        if (errorId != null) builder.header("X-Error-Id", errorId);
        return builder.body(body);
    }

    private Map<String, Object> toFieldError(FieldError fe) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("field", fe.getField());
        m.put("message", Optional.ofNullable(fe.getDefaultMessage()).orElse("Invalid value"));
        m.put("rejectedValue", fe.getRejectedValue());
        return m;
    }

    private Map<String, Object> toViolation(ConstraintViolation<?> v) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("path", String.valueOf(v.getPropertyPath()));
        m.put("message", v.getMessage());
        m.put("invalidValue", v.getInvalidValue());
        return m;
    }

    private Map<String, Object> base(HttpStatus status, HttpServletRequest req, String title, String detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", title);
        body.put("status", status.value());
        body.put("detail", detail);
        body.put("endpoint", req.getMethod() + " " + req.getRequestURI());
        body.put("timestamp", Instant.now().toString());
        return body;
    }

    private String detailFor(HttpStatus status, Exception ex, String errorId) {
        if (status.is5xxServerError()) return "An unexpected error occurred. Reference: " + errorId;
        return truncate(safeMessage(ex));
    }

    private String safeMessage(Throwable ex) {
        String msg = ex.getMessage();
        if (msg == null || msg.isBlank()) return "Unexpected error";
        return truncate(msg);
    }

    private String truncate(String s) {
        return s.length() > MAX_DETAIL_LEN ? s.substring(0, MAX_DETAIL_LEN) + "...(truncated)" : s;
    }

    private HttpStatus resolveStatus(Throwable ex) {
        for (Throwable t = ex; t != null; t = t.getCause()) {
            HttpStatus mapped = mapStatusFor(t);
            if (mapped != null) return mapped;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
    
    private HttpStatus mapStatusFor(Throwable t) {
        if (isAny(t,
                MethodArgumentNotValidException.class,
                BindException.class,
                ConstraintViolationException.class,
                HttpMessageNotReadableException.class,
                MissingServletRequestParameterException.class,
                MethodArgumentTypeMismatchException.class,
                IllegalArgumentException.class)) {
            return HttpStatus.BAD_REQUEST;
        }
        if (t instanceof AuthenticationException) return HttpStatus.UNAUTHORIZED;
        if (isAny(t, AccessDeniedException.class, java.nio.file.AccessDeniedException.class)) return HttpStatus.FORBIDDEN;
        if (isAny(t, EntityNotFoundException.class, NoSuchElementException.class)) return HttpStatus.NOT_FOUND;
        if (t instanceof DataIntegrityViolationException) return HttpStatus.CONFLICT;
    
        HttpStatus upstream = tryMapUpstreamByClassName(t);
        if (upstream != null) return upstream;
    
        if (t instanceof IllegalStateException) return HttpStatus.BAD_GATEWAY;
        return null;
    }
    
    private boolean isAny(Throwable t, Class<?>... types) {
        for (Class<?> c : types) if (c.isInstance(t)) return true;
        return false;
    }

    private HttpStatus mapUpstreamStatus(Throwable ex) {
        HttpStatus mapped = tryMapUpstreamByClassName(ex);
        return mapped != null ? mapped : HttpStatus.BAD_GATEWAY;
    }

    private HttpStatus tryMapUpstreamByClassName(Throwable t) {
        String cn = t.getClass().getName();
        String simple = t.getClass().getSimpleName();
        if (cn.startsWith("com.stripe.")) {
            // Best-effort mapping without Stripe SDK imports
            if (simple.contains("CardException")) return HttpStatus.PAYMENT_REQUIRED;      // 402
            if (simple.contains("InvalidRequest")) return HttpStatus.BAD_REQUEST;          // 400
            if (simple.contains("RateLimit")) return HttpStatus.TOO_MANY_REQUESTS;         // 429
            if (simple.contains("APIConnection")) return HttpStatus.BAD_GATEWAY;           // 502
            if (simple.contains("APIException")) return HttpStatus.BAD_GATEWAY;            // 502
            if (simple.contains("Authentication")) return HttpStatus.UNAUTHORIZED;         // 401
            return HttpStatus.BAD_GATEWAY;
        }
        return null;
    }

    private String upstreamTitle(HttpStatus status) {
        return switch (status) {
            case PAYMENT_REQUIRED -> "Payment failed";
            case TOO_MANY_REQUESTS -> "Rate limited";
            case UNAUTHORIZED -> "Upstream authentication failed";
            default -> "Upstream provider error";
        };
    }

    private String upstreamDetail(Throwable ex, HttpStatus status) {
        if (status.is5xxServerError()) return "A provider error occurred. Please try again later.";
        return truncate(safeMessage(ex));
    }
}



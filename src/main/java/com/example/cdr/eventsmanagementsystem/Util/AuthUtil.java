package com.example.cdr.eventsmanagementsystem.Util;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public  class AuthUtil {
    public static String getCurrentUserKeyclokId(){
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth instanceof JwtAuthenticationToken jwtAuth){
            Jwt jwt = jwtAuth.getToken();
            return jwt.getSubject();
        }
        throw new IllegalStateException("User not authenticated");
    }
}

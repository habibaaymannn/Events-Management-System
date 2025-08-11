package com.example.cdr.eventsmanagementsystem.Util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public class AuthUtil {
    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof Jwt jwt) {
                return jwt.getSubject(); 
            }
        }

        throw new RuntimeException("No authenticated user found");
    }
}

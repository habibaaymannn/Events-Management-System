package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class PasswordResetResponse {
    private boolean emailSent;
    private String forgotPasswordEntryUrl; // login screen where user clicks "Forgot password?"
    private String accountUrl;             // Keycloak account console (optional)
}

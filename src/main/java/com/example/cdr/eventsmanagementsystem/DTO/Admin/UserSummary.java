package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class UserSummary {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean enabled;
    private Long createdAt;   // UI uses createdAt; we’ll map from createdTimestamp
    private String role;      // <- the important one
    private String phoneNumber;
}

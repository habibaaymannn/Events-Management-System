package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserDetailsDto {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
}



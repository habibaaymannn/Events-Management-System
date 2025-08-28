package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import lombok.Data;

@Data
public class UserDetailsDto {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean active;
}



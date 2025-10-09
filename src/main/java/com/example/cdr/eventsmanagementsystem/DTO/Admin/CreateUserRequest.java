package com.example.cdr.eventsmanagementsystem.DTO.Admin;

public record CreateUserRequest(
    String firstName,
    String lastName,
    String email,
    String role,
    String username,
    String password
) {}

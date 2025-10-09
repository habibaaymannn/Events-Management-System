package com.example.cdr.eventsmanagementsystem.DTO.Admin;

public record SelfRegisterRequest(
    String firstName,
    String lastName,
    String email,
    String username,
    String password,
    String defaultRole
) {}

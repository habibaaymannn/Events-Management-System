package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import lombok.Data;

@Data
public class UserCreateDto {
    private String firstName;
    private String lastName;
    private String email;
    private String role; // admin, organizer, attendee, service_provider, venue_provider
}



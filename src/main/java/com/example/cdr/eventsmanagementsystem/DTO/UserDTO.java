package com.example.cdr.eventsmanagementsystem.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String userType;
}

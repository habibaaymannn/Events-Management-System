package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;

public interface IUserService {
    void saveUserData(UserDTO userDTO);
    boolean supports(String userType);
}

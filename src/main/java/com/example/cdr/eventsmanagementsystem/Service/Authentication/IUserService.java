package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;

public interface IUserService {
    void register(UserDTO userDTO);
    String getUserType();
}

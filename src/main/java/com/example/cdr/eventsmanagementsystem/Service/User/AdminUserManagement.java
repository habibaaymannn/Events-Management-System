package com.example.cdr.eventsmanagementsystem.Service.User;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserCreateDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/// this interface will be removed
public interface AdminUserManagement {
    Page<UserDetailsDto> getAllUsers(Pageable pageable);
    UserDetailsDto createUser(UserCreateDto userCreateDto);
    UserDetailsDto updateUserRole(String userId, String role);
    void deactivateUser(String userId);
    void resetPassword(String userId);
}

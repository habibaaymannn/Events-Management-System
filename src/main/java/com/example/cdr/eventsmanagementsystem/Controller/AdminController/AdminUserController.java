package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserCreateDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import com.example.cdr.eventsmanagementsystem.Service.User.AdminServiceInterface;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
/// this controller will be removed
@RestController
@RequiredArgsConstructor
@Tag(name = "Admin - users", description = "Admin user management APIs")
public class AdminUserController extends AdminController {
    private final AdminServiceInterface adminService;
    @Operation(summary = "Get all users", description = "Retrieves all users with pagination")
    @GetMapping(AdminControllerConstants.ADMIN_USERS_URL)
    public Page<UserDetailsDto> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getAllUsers(pageable);
    }

    @Operation(summary = "Create a new user", description = "Creates a new user with the provided details")
    @PostMapping(AdminControllerConstants.ADMIN_USERS_URL)
    public UserDetailsDto createUser(@RequestBody UserCreateDto dto) {
        return adminService.createUser(dto);
    }

    @Operation(summary = "Update user role", description = "Updates the role of an existing user")
    @PutMapping(AdminControllerConstants.ADMIN_UPDATE_USER_ROLE_URL)
    public UserDetailsDto updateUserRole(@PathVariable String userId, @RequestParam String role) {
        return adminService.updateUserRole(userId, role);
    }

    @Operation(summary = "Deactivate user", description = "Deactivates an existing user")
    @PostMapping(AdminControllerConstants.ADMIN_USER_DEACTIVATE_URL)
    public void deactivateUser(@PathVariable String userId) {
        adminService.deactivateUser(userId);
    }
}

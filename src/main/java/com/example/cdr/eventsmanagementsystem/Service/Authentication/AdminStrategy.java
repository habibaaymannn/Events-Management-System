package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AdminStrategy implements IUserService{
    private final AdminRepository adminRepository;
    @Override
    public void saveUserData(UserDTO userDTO) {
        Admin admin = adminRepository.findById(userDTO.getKeycloakId())
                .orElseGet(() -> {
                    Admin newAdmin = new Admin();
                    newAdmin.setId(userDTO.getKeycloakId());
                    return newAdmin;
                });

        admin.setEmail(userDTO.getEmail());
        admin.setFirstName(userDTO.getFirstName());
        admin.setLastName(userDTO.getLastName());

        adminRepository.save(admin);
    }
    @Override
    public boolean supports(String userType) {
        return "admin".equalsIgnoreCase(userType);
    }
}

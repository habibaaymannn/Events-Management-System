package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class AdminImpl implements IUserService{
    private final AdminRepository adminRepository;
    private final  KeycloakService keycloakService;

    @Override
    @Transactional
    public void register(UserDTO userDTO) {
        Admin admin = new Admin();
        admin.setEmail(userDTO.getEmail());
        admin.setFirstName(userDTO.getFirstName());
        admin.setLastName(userDTO.getLastName());
        admin.setPassword(userDTO.getPassword());

        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String keycloakUserId = keycloakService.createUser(
                admin.getEmail(),
                admin.getFirstName(),
                admin.getLastName(),
                admin.getPassword()
        );
        keycloakService.assignRoleToUser(keycloakUserId, "admin");

        admin.setId(keycloakUserId);

        adminRepository.save(admin);
    }
    @Override
    public String getUserType() {
        return "admin";
    }
}

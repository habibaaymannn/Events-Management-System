package com.example.cdr.eventsmanagementsystem.Service.Auth;

import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminHandler implements UserRoleHandler<Admin> {

    private final AdminRepository adminRepository;

    @Override
    public boolean supports(String role) {
        return "admin".equalsIgnoreCase(role);
    }

    @Override
    public Class<Admin> getRoleClass() {
        return Admin.class;
    }

    @Override
    @Transactional
    public Admin findUserById(String userId) {
        return adminRepository.findById(userId).orElse(null);
    }

    @Override
    @Transactional
    public Admin createNewUser(String userId, String email, String firstName, String lastName) {
        Admin admin = new Admin();
        admin.setId(userId);
        admin.setEmail(email);
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        return adminRepository.save(admin);
    }

    @Override
    @Transactional
    public BaseRoleEntity saveUser(BaseRoleEntity user) {
        return adminRepository.save((Admin) user);
    }

    @Override
    @Transactional
    public void deleteUser(String userId) {
        adminRepository.deleteById(userId);
    }
}

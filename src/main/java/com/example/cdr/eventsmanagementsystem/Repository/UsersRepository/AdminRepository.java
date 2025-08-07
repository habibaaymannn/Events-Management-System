package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, String> {
    boolean existsByEmail(String email);

}

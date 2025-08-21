package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.Model.User.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, String> {
    java.util.Optional<Admin> findByEmail(String email);
}
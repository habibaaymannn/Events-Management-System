package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizerRepository extends JpaRepository<Organizer, String> {
    boolean existsByEmail(String email);

}

package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;

@Repository
public interface OrganizerRepository extends JpaRepository<Organizer, String> {
    java.util.Optional<Organizer> findByEmail(String email);
}

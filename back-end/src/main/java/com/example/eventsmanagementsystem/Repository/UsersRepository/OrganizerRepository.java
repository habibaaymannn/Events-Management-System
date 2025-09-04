package com.example.eventsmanagementsystem.Repository.UsersRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.eventsmanagementsystem.Model.User.Organizer;

import java.util.Optional;

@Repository
public interface OrganizerRepository extends JpaRepository<Organizer, String> {

    Optional<Organizer> findByEmail(String email);
}

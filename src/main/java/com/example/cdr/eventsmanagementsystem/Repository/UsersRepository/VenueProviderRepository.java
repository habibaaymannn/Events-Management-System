package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;

public interface VenueProviderRepository extends JpaRepository<VenueProvider, String> {
    java.util.Optional<VenueProvider> findByEmail(String email);
}

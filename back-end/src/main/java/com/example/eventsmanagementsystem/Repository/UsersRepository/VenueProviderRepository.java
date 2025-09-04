package com.example.eventsmanagementsystem.Repository.UsersRepository;

import com.example.eventsmanagementsystem.Model.User.VenueProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VenueProviderRepository extends JpaRepository<VenueProvider, String> {
    Optional<VenueProvider> findByEmail(String email);
}

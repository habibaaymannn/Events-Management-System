package com.example.cdr.eventsmanagementsystem.Repository.Venue;

import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueProviderRepository extends JpaRepository<VenueProvider, Integer> {
}

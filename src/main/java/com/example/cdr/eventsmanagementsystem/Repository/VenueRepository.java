package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueRepository extends JpaRepository<Venue,Long> {
}

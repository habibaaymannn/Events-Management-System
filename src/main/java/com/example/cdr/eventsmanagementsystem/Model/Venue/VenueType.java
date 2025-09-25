package com.example.cdr.eventsmanagementsystem.Model.Venue;

import com.example.cdr.eventsmanagementsystem.Model.Event.VenueEventEligibility;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "venue_type")
public class VenueType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String name;
    String category;
    String description;
    @OneToMany(mappedBy = "venueType", cascade = CascadeType.ALL)
    private List<VenueEventEligibility> eligibleEvents = new ArrayList<>();
}
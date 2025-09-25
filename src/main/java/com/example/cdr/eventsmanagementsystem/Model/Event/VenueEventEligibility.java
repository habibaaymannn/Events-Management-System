package com.example.cdr.eventsmanagementsystem.Model.Event;

import com.example.cdr.eventsmanagementsystem.Model.Venue.VenueType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "venue_event_eligibility")
public class VenueEventEligibility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "event_type_id")
    private EventType eventType;
    @ManyToOne
    @JoinColumn(name = "venue_type_id")
    private VenueType venueType;
}

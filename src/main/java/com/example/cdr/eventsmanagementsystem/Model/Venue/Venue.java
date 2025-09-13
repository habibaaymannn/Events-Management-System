package com.example.cdr.eventsmanagementsystem.Model.Venue;

import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;
import java.util.stream.Collectors;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "venue")
public class Venue extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Availability availability;

    @Column(nullable = false)
    private String location;

    @Embedded
    private Capacity capacity;

    @Embedded
    private Pricing pricing;

    @ElementCollection
    private List<byte[]> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_provider_id")
    private VenueProvider venueProvider;

    @Column(name = "event_type", nullable = false)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "venue_supported_event_types",
            joinColumns = @JoinColumn(name = "venue_id"),
            foreignKey = @ForeignKey(name = "FK_venue_event_types")
    )
    @Enumerated(EnumType.STRING)
    private Set<EventType> supportedEventTypes = new HashSet<>();
}

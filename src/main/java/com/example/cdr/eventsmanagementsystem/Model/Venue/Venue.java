package com.example.cdr.eventsmanagementsystem.Model.Venue;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
@Entity
@Table(name = "venue")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(nullable = false)
    private String location;

    @Embedded
    private Capacity capacity;

    @Embedded
    private Pricing pricing;

    @ElementCollection
    private List<String> images;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_provider_id")
    private VenueProvider venueProvider;

    @OneToMany(mappedBy = "venue")
    private List<Booking> bookings = new ArrayList<>();

    @ElementCollection
    private Set<EventType> supportedEventTypes;
}

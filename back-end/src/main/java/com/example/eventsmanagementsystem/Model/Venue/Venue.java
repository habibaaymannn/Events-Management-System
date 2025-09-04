package com.example.eventsmanagementsystem.Model.Venue;

import com.example.eventsmanagementsystem.Model.Event.EventType;
import com.example.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.eventsmanagementsystem.Util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private List<String> images;

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

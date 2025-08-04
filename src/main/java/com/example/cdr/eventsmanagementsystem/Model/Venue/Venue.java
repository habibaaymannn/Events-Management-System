package com.example.cdr.eventsmanagementsystem.Model.Venue;

import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import java.util.List;

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
}

package com.example.cdr.eventsmanagementsystem.Model.User;

import java.util.ArrayList;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "venue_providers")
public class VenueProvider extends BaseRoleEntity {
    @OneToMany(mappedBy = "venueProvider")
    private List<Venue> venues = new ArrayList<>();
}

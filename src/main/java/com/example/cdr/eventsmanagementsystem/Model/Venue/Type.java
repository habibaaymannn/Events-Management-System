package com.example.cdr.eventsmanagementsystem.Model.Venue;

import com.zaxxer.hikari.metrics.dropwizard.CodaHaleMetricsTracker;
import lombok.RequiredArgsConstructor;

import java.util.List;
@RequiredArgsConstructor
public enum Type {
    // Private venues
    VILLA("Private"),
    CHALET("Private"),
    FARMHOUSE("Private"),

    // Public venues
    HOTEL("Public"),
    RESTAURANT("Public"),
    CONFERENCE_CENTER("Public"),
    CLUB("Public"),

    // Institutional venues
    SCHOOL_HALL("Institution"),
    UNIVERSITY_AUDITORIUM("Institution"),

    // Outdoor venues
    PARK("Outdoor"),
    GARDEN("Outdoor"),
    BEACH("Outdoor"),

    // Cultural/Sports venues
    THEATER("Cultural"),
    ART_GALLERY("Cultural"),
    SPORTS_ARENA("Sports");

    private final String category;

    public String getCategory() {
        return category;
    }
}
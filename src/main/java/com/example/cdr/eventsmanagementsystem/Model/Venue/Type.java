package com.example.cdr.eventsmanagementsystem.Model.Venue;

import com.zaxxer.hikari.metrics.dropwizard.CodaHaleMetricsTracker;

import java.util.List;

public enum Type {
    //Private venues
    VILLA,
    CHALET,
    FARMHOUSE,

    // Public venues
    HOTEL_HALL,
    CONFERENCE_CENTER,
    RESTAURANT_PRIVATE_ROOM,
    LOUNGE,
    THEATER,
    COUNTRY_CLUB,
    SPORTS_AREA,

    // Institutional venues
    SCHOOL_HALL,
    UNIVERSITY_AUDITORIUM
}

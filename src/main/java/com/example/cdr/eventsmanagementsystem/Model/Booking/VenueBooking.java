package com.example.cdr.eventsmanagementsystem.Model.Booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@EqualsAndHashCode(callSuper = true)
@Table(name = "venue_bookings")
public class VenueBooking extends Booking {
    @Column(nullable = false)
    private Long venueId;

    @Column(nullable = false)
    private Long eventId;
}

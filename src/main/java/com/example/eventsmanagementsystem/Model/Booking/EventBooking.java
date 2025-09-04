package com.example.eventsmanagementsystem.Model.Booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@EqualsAndHashCode(callSuper = true)
@Table(name = "event_bookings")
public class EventBooking extends Booking {
    @Column(nullable = false)
    private Long eventId;
}

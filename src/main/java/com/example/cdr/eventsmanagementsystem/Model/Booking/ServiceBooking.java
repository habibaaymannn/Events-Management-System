package com.example.cdr.eventsmanagementsystem.Model.Booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@EqualsAndHashCode(callSuper = true)
@Table(name = "service_bookings")
public class ServiceBooking extends Booking {
    @Column(nullable = false)
    private Long serviceId;

    @Column(nullable = false)
    private Long eventId;
}

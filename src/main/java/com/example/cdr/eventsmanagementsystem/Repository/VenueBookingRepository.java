package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueBookingRepository extends JpaRepository<VenueBooking, Long> {
    VenueBooking findByStripeSessionId(String sessionId);
    EventBooking findByStripePaymentId(String paymentId);
    long countByStatus(BookingStatus status);
}

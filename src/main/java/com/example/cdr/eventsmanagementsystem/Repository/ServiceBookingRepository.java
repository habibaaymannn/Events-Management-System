package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {
    ServiceBooking findByStripeSessionId(String sessionId);
    EventBooking findByStripePaymentId(String paymentId);
}

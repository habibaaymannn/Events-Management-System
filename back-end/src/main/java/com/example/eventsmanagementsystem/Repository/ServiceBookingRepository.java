package com.example.eventsmanagementsystem.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.eventsmanagementsystem.Model.Booking.ServiceBooking;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {
    ServiceBooking findByStripeSessionId(String sessionId);
    ServiceBooking findByStripePaymentId(String paymentId);

    Page<ServiceBooking> findByCreatedBy(String createdBy, Pageable pageable);

    @Query("SELECT sb FROM ServiceBooking sb JOIN Services s ON s.id = sb.serviceId WHERE s.serviceProvider.id = :providerId")
    Page<ServiceBooking> findByServiceProviderId(@Param("providerId") String providerId, Pageable pageable);
}

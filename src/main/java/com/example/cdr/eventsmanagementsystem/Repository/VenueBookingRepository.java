package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueBookingRepository extends JpaRepository<VenueBooking, Long> {
    VenueBooking findByStripeSessionId(String sessionId);
    VenueBooking findByStripePaymentId(String paymentId);
    long countByStatus(BookingStatus status);
    Page<VenueBooking> findByCreatedBy(String createdBy, Pageable pageable);

    @Query("SELECT vb FROM VenueBooking vb JOIN Venue v ON v.id = vb.venueId WHERE v.venueProvider.id = :providerId")
    Page<VenueBooking> findByVenueProviderId(@Param("providerId") String providerId, Pageable pageable);
}

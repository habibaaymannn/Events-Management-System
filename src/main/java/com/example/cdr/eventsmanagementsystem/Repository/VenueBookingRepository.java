package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import com.example.cdr.eventsmanagementsystem.DTO.projections.LocalDateCount;

@Repository
public interface VenueBookingRepository extends JpaRepository<VenueBooking, Long> {
    VenueBooking findByStripeSessionId(String sessionId);
    VenueBooking findByStripePaymentId(String paymentId);
    long countByStatus(BookingStatus status);
    Page<VenueBooking> findByCreatedBy(String createdBy, Pageable pageable);

    @Query("SELECT vb FROM VenueBooking vb JOIN Venue v ON v.id = vb.venueId WHERE v.venueProvider.id = :providerId")
    Page<VenueBooking> findByVenueProviderId(@Param("providerId") String providerId, Pageable pageable);
    
    Page<VenueBooking> findByEventId(Long eventId, Pageable pageable);

    // count new bookings per day (based on createdAt)
    @Query("""
      SELECT function('date', b.createdAt) AS date, COUNT(b) AS count
      FROM VenueBooking b
      WHERE b.createdAt BETWEEN :start AND :end
      GROUP BY function('date', b.createdAt)
      ORDER BY function('date', b.createdAt)
    """)
    List<LocalDateCount> countDailyBookingsBetween(@Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end);

    // count cancellations per day (based on cancelledAt if set, else updatedAt)
    @Query("""
      SELECT function('date', COALESCE(b.cancelledAt, b.updatedAt)) AS date, COUNT(b) AS count
      FROM VenueBooking b
      WHERE (b.status = com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus.CANCELLED
            OR b.cancelledAt IS NOT NULL)
        AND COALESCE(b.cancelledAt, b.updatedAt) BETWEEN :start AND :end
      GROUP BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
      ORDER BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
    """)
    List<LocalDateCount> countDailyCancellationsBetween(@Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end);

}

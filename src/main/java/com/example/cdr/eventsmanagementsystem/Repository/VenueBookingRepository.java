package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus;
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
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

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

    @Query("""
      SELECT function('date', COALESCE(b.cancelledAt, b.updatedAt)) AS date, COUNT(b) AS count
      FROM VenueBooking b
      WHERE (b.status = :cancelled OR b.cancelledAt IS NOT NULL)
        AND COALESCE(b.cancelledAt, b.updatedAt) BETWEEN :start AND :end
      GROUP BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
      ORDER BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
    """)
    List<LocalDateCount> countDailyCancellationsBetween(@Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end,
                                                        @Param("cancelled") BookingStatus cancelled);



    @Query("""
    select count(b) from VenueBooking b
    where b.status = :status
    and b.cancelledAt is not null
    and b.cancelledAt >= :start
    and b.cancelledAt <  :end
    """)
    long countCancelledBetween(@Param("status") BookingStatus status,
                            @Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end);

                            

    @Query("""
      select count(b) from VenueBooking b
      where b.createdAt >= :start and b.createdAt < :end and b.status = :status
    """)
    long countByStatusAndCreatedAtBetween(@Param("status") BookingStatus status,
                                          @Param("start") java.time.LocalDateTime start,
                                          @Param("end") java.time.LocalDateTime end);

    @Query("""
      select count(b) from VenueBooking b
      where b.createdAt >= :start
        and b.createdAt <  :end
        and b.status in :statuses
    """)
    long countCreatedBetweenForStatuses(
        @Param("start") java.time.LocalDateTime start,
        @Param("end")   java.time.LocalDateTime end,
        @Param("statuses") java.util.Collection<BookingStatus> statuses
    );
                                      
    @Query("""
        select count(distinct vb.venueId)
        from VenueBooking vb
        where (
            vb.paymentStatus in :paymentStatuses
            or vb.status in :statuses
        )
        and vb.status <> :excludedStatus
        and vb.startTime <= :now and vb.endTime >= :now
    """)
    long countDistinctActiveVenueIdsAt(
        @Param("now") LocalDateTime now,
        @Param("paymentStatuses") java.util.Collection<PaymentStatus> paymentStatuses,
        @Param("statuses") java.util.Collection<BookingStatus> statuses,
        @Param("excludedStatus") BookingStatus excludedStatus
    );


    List<VenueBooking> findByVenueId(Long venueId);
}

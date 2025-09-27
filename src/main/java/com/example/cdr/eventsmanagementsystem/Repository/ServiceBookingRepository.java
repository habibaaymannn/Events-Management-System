package com.example.cdr.eventsmanagementsystem.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import com.example.cdr.eventsmanagementsystem.DTO.projections.LocalDateCount;


import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {
    ServiceBooking findByStripeSessionId(String sessionId);
    ServiceBooking findByStripePaymentId(String paymentId);

    Page<ServiceBooking> findByCreatedBy(String createdBy, Pageable pageable);

    @Query("SELECT sb FROM ServiceBooking sb JOIN Services s ON s.id = sb.serviceId WHERE s.serviceProvider.id = :providerId")
    Page<ServiceBooking> findByServiceProviderId(@Param("providerId") String providerId, Pageable pageable);
    
    Page<ServiceBooking> findByEventId(Long eventId, Pageable pageable);

    @Query("""
      SELECT function('date', b.createdAt) AS date, COUNT(b) AS count
      FROM ServiceBooking b
      WHERE b.createdAt BETWEEN :start AND :end
      GROUP BY function('date', b.createdAt)
      ORDER BY function('date', b.createdAt)
    """)
    List<LocalDateCount> countDailyBookingsBetween(@Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end);

    @Query("""
        select count(b) from ServiceBooking b
        where b.status = :status
          and b.cancelledAt is not null
          and b.cancelledAt >= :start
          and b.cancelledAt <  :end
        """)
    long countCancelledBetween(@Param("status") BookingStatus status,
                              @Param("start") LocalDateTime start,
                              @Param("end") LocalDateTime end);
                                              
    @Query("""
      SELECT function('date', COALESCE(b.cancelledAt, b.updatedAt)) AS date, COUNT(b) AS count
      FROM ServiceBooking b
      WHERE (b.status = :cancelled OR b.cancelledAt IS NOT NULL)
        AND COALESCE(b.cancelledAt, b.updatedAt) BETWEEN :start AND :end
      GROUP BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
      ORDER BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
    """)
    List<LocalDateCount> countDailyCancellationsBetween(@Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end,
                                                        @Param("cancelled") BookingStatus cancelled);


    @Query("""
    select count(b) from ServiceBooking b
    where b.createdAt >= :start and b.createdAt < :end and b.status = :status
    """)
    long countByStatusAndCreatedAtBetween(@Param("status") BookingStatus status,
                                        @Param("start") java.time.LocalDateTime start,
                
                                        @Param("end") java.time.LocalDateTime end);

    @Query("""
      select count(b) from ServiceBooking b
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
        select count(distinct s.serviceProvider.id)
        from ServiceBooking sb
        join Services s on s.id = sb.serviceId
        where sb.status in :statuses
        and sb.startTime <= :now and sb.endTime >= :now
    """)
    long countDistinctActiveServiceProvidersAt(
        @Param("now") java.time.LocalDateTime now,
        @Param("statuses") java.util.Collection<BookingStatus> statuses
    );



}

package com.example.cdr.eventsmanagementsystem.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.DTO.projections.LocalDateCount;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;

@Repository
public interface EventBookingRepository extends JpaRepository<EventBooking, Long> {
    @Query("select function('date', b.createdAt) as date, count(b) as count from EventBooking b "+
            "where function('date', b.createdAt) >= :start and function('date', b.createdAt) <= :end "+
            "group by function('date', b.createdAt) order by function('date', b.createdAt)")
    List<LocalDateCount> countDailyBookingsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("select function('date', b.cancelledAt) as date, count(b) as count from EventBooking b "+
            "where b.cancelledAt is not null and function('date', b.cancelledAt) >= :start and function('date', b.cancelledAt) <= :end "+
            "group by function('date', b.cancelledAt) order by function('date', b.cancelledAt)")
    List<LocalDateCount> countDailyCancellationsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List <EventBooking> findByStatusAndStartTimeBetween(
            BookingStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    Page<EventBooking> findByStatusAndUpdatedAtBetween(
            BookingStatus status,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    EventBooking findByStripeSessionId(String sessionId);

    EventBooking findByStripePaymentId(String paymentId);

    List<EventBooking> findByEventId(Long eventId);

    Page<EventBooking> findByEventId(Long eventId, Pageable pageable);

    Page<EventBooking> findByCreatedBy(String createdBy, Pageable pageable);
}

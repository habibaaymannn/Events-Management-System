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
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Repository
public interface EventBookingRepository extends JpaRepository<EventBooking, Long> {

    @Query("select function('date', b.createdAt) as date, count(b) as count from EventBooking b "
            + "where function('date', b.createdAt) >= :start and function('date', b.createdAt) <= :end "
            + "group by function('date', b.createdAt) order by function('date', b.createdAt)")
    List<LocalDateCount> countDailyBookingsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("select function('date', b.cancelledAt) as date, count(b) as count from EventBooking b "
            + "where b.cancelledAt is not null and function('date', b.cancelledAt) >= :start and function('date', b.cancelledAt) <= :end "
            + "group by function('date', b.cancelledAt) order by function('date', b.cancelledAt)")
    List<LocalDateCount> countDailyCancellationsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("""
        select count(b) from EventBooking b
        where b.status = :status
        and b.cancelledAt is not null
        and b.cancelledAt >= :start
        and b.cancelledAt <  :end
        """)
    long countCancelledBetween(@Param("status") BookingStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<EventBooking> findByStatusAndStartTimeBetween(
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

    @Query("""
        select count(b) from EventBooking b
        where b.createdAt >= :start
        and b.createdAt <  :end
        and b.status in :statuses
        """)
    long countCreatedBetweenForStatuses(
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end,
            @Param("statuses") java.util.Collection<com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus> statuses
    );

    EventBooking findByStripeSessionId(String sessionId);

    EventBooking findByStripePaymentId(String paymentId);

    List<EventBooking> findByEventId(Long eventId);

    @Query("select eb from EventBooking eb where eb.eventId = :eventId order by eb.createdAt desc")
    Page<EventBooking> findByEventIdOrderByCreatedAtDesc(Long eventId, Pageable pageable);

    Page<EventBooking> findByCreatedBy(String createdBy, Pageable pageable);

    @Query("""
        SELECT function('date', b.createdAt) AS date, COUNT(b) AS count
        FROM EventBooking b
        WHERE b.createdAt BETWEEN :start AND :end
        GROUP BY function('date', b.createdAt)
        ORDER BY function('date', b.createdAt)
        """)
    List<LocalDateCount> countDailyBookingsBetween(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
        SELECT function('date', COALESCE(b.cancelledAt, b.updatedAt)) AS date, COUNT(b) AS count
        FROM EventBooking b
        WHERE (b.status = com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus.CANCELLED
                OR b.cancelledAt IS NOT NULL)
        AND COALESCE(b.cancelledAt, b.updatedAt) BETWEEN :start AND :end
        GROUP BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
        ORDER BY function('date', COALESCE(b.cancelledAt, b.updatedAt))
        """)
    List<LocalDateCount> countDailyCancellationsBetween(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
        select count(b) from EventBooking b
        where b.createdAt >= :start and b.createdAt < :end and b.status = :status
        """)
    long countByStatusAndCreatedAtBetween(@Param("status") BookingStatus status,
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end);

    interface OrganizerRevenueRow {

        Long getOrganizerId();

        String getFirstName();

        String getLastName();

        java.math.BigDecimal getRevenue();
    }

    @Query("""
                select e.organizer.id as organizerId,
                e.organizer.firstName as firstName,
                e.organizer.lastName  as lastName,
                coalesce(sum(
                        case
                        when b.paymentStatus = com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus.CAPTURED
                        then b.amount
                        when b.paymentStatus = com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus.PARTIALLY_REFUNDED
                        then (b.amount - coalesce(b.refundAmount, 0))
                        when b.paymentStatus = com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus.REFUNDED
                        then 0
                        else 0
                        end
                ), 0) as revenue
                from EventBooking b
                join Event e on e.id = b.eventId
                group by e.organizer.id, e.organizer.firstName, e.organizer.lastName
                order by revenue desc
        """)
    java.util.List<OrganizerRevenueRow> sumRevenueByOrganizer();
}

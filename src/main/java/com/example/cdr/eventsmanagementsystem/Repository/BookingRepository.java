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
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBookerId(String bookerId);
    List<Booking> findByEvent_Id(Long eventId);

    Page<Booking> findByService_ServiceProvider_Id(String serviceProviderId, Pageable pageable);
    Page<Booking> findByVenue_VenueProvider_Id(String venueProviderId,Pageable pageable);

    long countByVenueIsNotNullAndStatus(BookingStatus status);

    @Query("select function('date', b.createdAt) as date, count(b) as count from Booking b "+
           "where b.createdAt is not null and function('date', b.createdAt) >= :start and function('date', b.createdAt) <= :end "+
           "group by function('date', b.createdAt) order by function('date', b.createdAt)")
    List<LocalDateCount> countDailyBookingsBetween(@Param("start") LocalDate start,
                                                   @Param("end") LocalDate end);

    @Query("select function('date', b.cancelledAt) as date, count(b) as count from Booking b "+
           "where b.cancelledAt is not null and function('date', b.cancelledAt) >= :start and function('date', b.cancelledAt) <= :end "+
           "group by function('date', b.cancelledAt) order by function('date', b.cancelledAt)")
    List<LocalDateCount> countDailyCancellationsBetween(@Param("start") LocalDate start,
                                                        @Param("end") LocalDate end);

    Page<Booking> findByStatusAndUpdatedAtBetweenAndStripePaymentIdIsNotNull(
            BookingStatus status,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable);

    @Query("select (count(b) > 0) from Booking b where b.venue.id = :venueId and b.status in :statuses and b.startTime < :end and b.endTime > :start")
    boolean existsVenueConflict(@Param("venueId") Long venueId,
                                @Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end,
                                @Param("statuses") List<BookingStatus> statuses);

    @Query("select (count(b) > 0) from Booking b where b.service.id = :serviceId and b.status in :statuses and b.startTime < :end and b.endTime > :start")
    boolean existsServiceConflict(@Param("serviceId") Long serviceId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end,
                                  @Param("statuses") List<BookingStatus> statuses);
}

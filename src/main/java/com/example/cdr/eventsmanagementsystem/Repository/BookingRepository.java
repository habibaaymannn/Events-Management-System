package com.example.cdr.eventsmanagementsystem.Repository;

import java.time.LocalDate;
import java.util.List;

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
}

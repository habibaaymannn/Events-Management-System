package com.example.cdr.eventsmanagementsystem.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBookerId(String bookerId);
    List<Booking> findByEvent_Id(Long eventId);
}

package com.example.cdr.eventsmanagementsystem.Service.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing services and their bookings.
 */


public interface ServicesServiceInterface {
    ServicesDTO addService(ServicesDTO dto);
    ServicesDTO updateAvailability(Long serviceId);
    Booking respondToBookingRequests (Long bookingId, BookingStatus status);
    Page<BookingDetailsResponse> getBookingsForServiceProvider(Pageable pageable);
    void cancelBooking(Long bookingId);
}

package com.example.cdr.eventsmanagementsystem.Service.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import java.nio.file.AccessDeniedException;

public interface ServicesServiceInterface {
    ServicesDTO addService(ServicesDTO dto);
    ServicesDTO updateAvailability(Long serviceId) throws AccessDeniedException;
    Booking respondToBookingRequests (Long bookingId, BookingStatus status) throws AccessDeniedException;
    void cancelBooking(Long bookingId) throws AccessDeniedException;
}

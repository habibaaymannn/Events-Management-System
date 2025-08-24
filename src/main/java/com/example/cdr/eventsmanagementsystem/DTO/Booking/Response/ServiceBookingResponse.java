package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;

import lombok.Data;

@Data
public class ServiceBookingResponse {
    private Long bookingId;
    private Long serviceId;
    private String organizerId;
    private BookingStatus status;
        private String paymentUrl; 
}

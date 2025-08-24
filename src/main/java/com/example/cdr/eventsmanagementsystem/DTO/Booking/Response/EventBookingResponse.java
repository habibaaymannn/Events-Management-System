package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;

import lombok.Data;

@Data
public class EventBookingResponse {
    private Long bookingId;
    private Long eventId;
    private String attendeeId;
    private BookingStatus status;
    private String paymentConfirmation;
    private String paymentUrl; 
}

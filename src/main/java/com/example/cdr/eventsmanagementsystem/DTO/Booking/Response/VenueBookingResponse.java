package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BaseBookingDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;

import lombok.Data;

@Data
public class VenueBookingResponse extends BaseBookingDTO {
    private Long bookingId;
    private Long venueId;
    private String organizerId;
    private BookingStatus status;
    private String paymentUrl;
}

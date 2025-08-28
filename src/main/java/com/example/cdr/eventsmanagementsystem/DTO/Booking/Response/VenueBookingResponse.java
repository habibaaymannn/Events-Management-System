package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BaseBookingDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class VenueBookingResponse extends BaseBookingDTO {
    private Long venueId;
    private Long eventId;
    private BookingStatus status;
}

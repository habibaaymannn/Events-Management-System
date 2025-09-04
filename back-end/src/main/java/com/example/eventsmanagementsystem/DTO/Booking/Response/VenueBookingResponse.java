package com.example.eventsmanagementsystem.DTO.Booking.Response;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class VenueBookingResponse extends BookingResponse {
    private Long venueId;
    private Long eventId;
}

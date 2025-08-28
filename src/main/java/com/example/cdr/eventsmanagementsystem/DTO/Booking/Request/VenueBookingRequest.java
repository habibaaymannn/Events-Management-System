package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class VenueBookingRequest extends BaseBookingDTO {
    private Long venueId;
    private Long eventId;  
}

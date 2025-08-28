package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class EventBookingResponse extends BookingResponse {
    private Long eventId;
}

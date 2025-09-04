package com.example.eventsmanagementsystem.DTO.Booking.Response;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ServiceBookingResponse extends BookingResponse {
    private Long serviceId;
    private Long eventId;
}
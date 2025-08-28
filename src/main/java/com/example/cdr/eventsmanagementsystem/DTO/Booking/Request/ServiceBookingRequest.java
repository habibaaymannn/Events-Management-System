package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ServiceBookingRequest extends BaseBookingDTO {
    private Long serviceId;
    private Long eventId; 
}

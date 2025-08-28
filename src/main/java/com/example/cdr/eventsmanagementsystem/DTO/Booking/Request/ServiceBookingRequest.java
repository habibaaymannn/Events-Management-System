package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;

@Data
public class ServiceBookingRequest extends BaseBookingDTO {
    private Long serviceId;
    
    // private String organizerId;  
    
    private Long eventId; 
}

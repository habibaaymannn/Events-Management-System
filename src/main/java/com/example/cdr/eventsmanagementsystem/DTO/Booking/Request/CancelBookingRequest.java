package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;

@Data
public class CancelBookingRequest {
    private Long bookingId;
    
    private String cancelledById; 
    
    private String reason;  
}

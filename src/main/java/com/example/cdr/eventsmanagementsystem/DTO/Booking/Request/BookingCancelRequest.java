package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;

@Data
public class BookingCancelRequest {
    private Long bookingId;
    
    private String reason;  
}

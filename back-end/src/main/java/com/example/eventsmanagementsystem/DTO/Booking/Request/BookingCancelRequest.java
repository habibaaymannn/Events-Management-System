package com.example.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;

@Data
public class BookingCancelRequest {
    private Long bookingId;
    
    private String reason;  
}

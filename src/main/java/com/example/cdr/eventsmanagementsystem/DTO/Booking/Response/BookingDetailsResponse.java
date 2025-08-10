package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import java.time.LocalDateTime;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookerType;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;

import lombok.Data;

@Data
public class BookingDetailsResponse {
    private Long id;
    private BookingType type;
    private BookingStatus status;
    
    private String bookerId;
    private BookerType bookerType;  
    
    private Long eventId;
    private Long venueId; 
    private Long serviceId;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private String stripePaymentId;
    private LocalDateTime refundProcessedAt;
    
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

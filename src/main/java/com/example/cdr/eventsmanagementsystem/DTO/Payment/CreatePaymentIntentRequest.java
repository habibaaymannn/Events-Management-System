package com.example.cdr.eventsmanagementsystem.DTO.Payment;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentIntentRequest {
    private BigDecimal amount;
    
    private String currency = "usd";
    
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    private String description;
    
    // For organizer bookings
    private Long venueId;
    private Long serviceId;
    private Long eventId;
}

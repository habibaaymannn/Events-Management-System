package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data // We need to use annotations -> Nullable, etc..
public abstract class BaseBookingDTO {
    protected LocalDateTime startTime; 
    protected LocalDateTime endTime;
    protected String currency = "usd";
    protected BigDecimal amount;
    protected Boolean isCaptured; // true = "Pay Now", false = "Reserve Now, Pay Later"
}

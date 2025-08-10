package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public abstract class BaseBookingDTO {
    protected LocalDateTime startTime; 
    protected LocalDateTime endTime;
    protected String currency = "usd";
}

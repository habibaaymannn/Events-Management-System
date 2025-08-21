package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class RefundRequest {
    private BigDecimal amount; // optional; null for full
    private String reason; // requested_by_customer, duplicate, fraudulent or free-text mapped
}



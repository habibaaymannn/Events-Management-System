package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;

@Data
public class VoidPaymentRequest {
    private String reason; // optional cancellation reason for payment intent
}



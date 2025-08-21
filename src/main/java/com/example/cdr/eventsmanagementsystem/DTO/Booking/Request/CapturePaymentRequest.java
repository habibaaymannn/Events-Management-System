package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CapturePaymentRequest {
    private BigDecimal amountToCapture; // null means full capture
}



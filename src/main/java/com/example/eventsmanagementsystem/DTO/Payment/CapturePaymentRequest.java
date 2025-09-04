package com.example.eventsmanagementsystem.DTO.Payment;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CapturePaymentRequest {
    private BigDecimal amount; // null for full capture
}



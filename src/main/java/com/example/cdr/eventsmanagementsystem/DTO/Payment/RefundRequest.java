package com.example.cdr.eventsmanagementsystem.DTO.Payment;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class RefundRequest {
    private BigDecimal amount; // optional
    private String reason;     // requested_by_customer | duplicate | fraudulent
}



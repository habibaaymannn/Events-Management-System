package com.example.cdr.eventsmanagementsystem.DTO.Payment;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class AuthorizePaymentRequest {
    private BigDecimal amount; 
    private String currency;  
    private String paymentMethodId; 
}



package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PaymentDetailsDTO {
    private String paymentMethodId; // Stripe Payment Method ID
    
    private String paymentIntentId; // For confirming existing payment intent
    
    private BigDecimal amount;
    
    private String currency = "usd";
    
    private boolean savePaymentMethod = false;
    
    private String customerEmail;
    
    private String customerName;
}

package com.example.cdr.eventsmanagementsystem.DTO.Payment;

import lombok.Data;

@Data
public class PaymentIntentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String status;
    private Long amount;
    private String currency;
    private String customerId;
    private String description;
}

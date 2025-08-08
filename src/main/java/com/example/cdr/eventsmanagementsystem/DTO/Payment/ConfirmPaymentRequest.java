package com.example.cdr.eventsmanagementsystem.DTO.Payment;

import lombok.Data;

@Data
public class ConfirmPaymentRequest {
    private String paymentIntentId;
    
    private String paymentMethodId;
    
    private String returnUrl;
}

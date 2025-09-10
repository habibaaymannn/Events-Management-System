package com.example.cdr.eventsmanagementsystem.DTO.Payment;

import lombok.Data;

@Data
public class SaveCardRequest {
    private String paymentMethodId; // card to attach
    private boolean setAsDefault;
}



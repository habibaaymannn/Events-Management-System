package com.example.eventsmanagementsystem.DTO.Payment;

import com.example.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.eventsmanagementsystem.Model.Booking.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmationResponse {
    private String status;   // "success", "processing", "canceled", "failed"
    private String message;          
    private String bookingReference;  
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private String nextAction;        
    private String redirectUrl;     
    private boolean requiresCapture;  
    private PaymentDetails payment;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDetails {
        private String paymentIntentId;
        private String amount;
        private String currency;
        private String method;           // "card", "bank_transfer", etc.
        private boolean authorizationOnly;
    }
}

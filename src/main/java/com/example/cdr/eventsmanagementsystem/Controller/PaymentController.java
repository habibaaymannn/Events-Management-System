package com.example.cdr.eventsmanagementsystem.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.DTO.Payment.ConfirmPaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.CreatePaymentIntentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.PaymentIntentResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.PaymentMapper;
import com.example.cdr.eventsmanagementsystem.Service.Booking.StripeService;
import com.stripe.model.PaymentIntent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final PaymentMapper paymentMapper;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @RequestBody CreatePaymentIntentRequest request) {
        
        
        String customerId = null;
        if (request.getCustomerEmail() != null) {
            var customer = stripeService.createCustomer(
                request.getCustomerEmail(), 
                request.getCustomerName(), 
                request.getCustomerPhone()
            );
            customerId = customer.getId();
        }
        
        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
            request.getAmount(),
            request.getCurrency(),
            customerId,
            request.getDescription()
        );
        
        PaymentIntentResponse response = paymentMapper.fromStripePaymentIntent(paymentIntent);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/intent/{paymentIntentId}")
    public ResponseEntity<PaymentIntentResponse> getPaymentIntent(
            @PathVariable String paymentIntentId) {
        
        PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(paymentIntentId);
        PaymentIntentResponse response = paymentMapper.fromStripePaymentIntent(paymentIntent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    public ResponseEntity<PaymentIntentResponse> confirmPayment(
            @RequestBody ConfirmPaymentRequest request) {
                
        try {
            PaymentIntent paymentIntent = stripeService.confirmPaymentIntent(
                request.getPaymentIntentId(),
                request.getPaymentMethodId()
            );
            PaymentIntentResponse response = paymentMapper.fromStripePaymentIntent(paymentIntent);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}

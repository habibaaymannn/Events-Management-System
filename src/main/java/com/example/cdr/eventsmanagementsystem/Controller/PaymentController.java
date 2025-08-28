package com.example.cdr.eventsmanagementsystem.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.CheckoutSessionResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.AutoPayToggleRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.PaymentConfirmationResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.SaveCardRequest;
import com.example.cdr.eventsmanagementsystem.Service.Payment.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(PaymentConstants.PAYMENT_BASE_URL)
@Tag(name = "Payments", description = "All payment operations")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Start save-card session (Checkout setup mode)")
    @PostMapping(PaymentConstants.SETUP_SESSION)
    public ResponseEntity<CheckoutSessionResponse> createSetupSession() {
        return ResponseEntity.ok(paymentService.createSetupCheckoutSessionForCurrentUser());
    }

    @Operation(summary = "Set default payment method", description = "Set a saved payment method as the default for the current user")
    @PostMapping(PaymentConstants.DEFAULT_PAYMENT_METHOD)
    public ResponseEntity<Void> setDefaultPaymentMethod(@RequestBody SaveCardRequest request) {
        if (request.getPaymentMethodId() != null) {
            paymentService.setDefaultPaymentMethodForCurrentUser(request.getPaymentMethodId());
        }
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Toggle auto-pay feature", description = "Enable or disable automatic payment for future bookings")
    @PostMapping(PaymentConstants.AUTO_PAY)
    public ResponseEntity<Void> toggleAutoPay(@RequestBody AutoPayToggleRequest request) {
        paymentService.toggleAutoPay(request.isEnable());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Payment confirmation", 
               description = "Handle Stripe redirect after payment completion. Supports both immediate payment and authorize-only flows.")
    @GetMapping(PaymentConstants.PAYMENT_CONFIRM)
    public ResponseEntity<PaymentConfirmationResponse> confirmPayment(
            @RequestParam(name = "session_id", required = false) String sessionId,
            @RequestParam(name = "setup_session_id", required = false) String setupSessionId,
            @RequestParam(required = false) Boolean canceled,
            @RequestParam(name = "setup_canceled", required = false) Boolean setupCanceled) {
        
        PaymentConfirmationResponse response = paymentService.confirmPayment(
                sessionId, setupSessionId, canceled, setupCanceled);
        
        return ResponseEntity.ok(response);
    }
}



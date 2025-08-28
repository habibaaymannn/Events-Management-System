package com.example.cdr.eventsmanagementsystem.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants;
import com.example.cdr.eventsmanagementsystem.Service.Payment.StripeWebhookService;
import com.stripe.model.Event;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);
    private final StripeWebhookService webhookService;

    @Operation(summary = "Handle Stripe webhook events", description = "Process incoming Stripe webhook events")
    @PostMapping(PaymentConstants.STRIPE_WEBHOOK_URL)
    @Transactional
    public ResponseEntity<String> handle(@RequestBody String payload,
                                         @RequestHeader(name = "Stripe-Signature", required = false) String sigHeader) {
        try {
            log.info("Received Stripe webhook: endpoint={}", PaymentConstants.STRIPE_WEBHOOK_URL);
            Event event = webhookService.constructEvent(payload, sigHeader);
            log.info("Processing Stripe event: type={}, id={}", event.getType(), event.getId());
            webhookService.processEvent(event);
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Error processing Stripe webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("webhook error");
        }
    }
}



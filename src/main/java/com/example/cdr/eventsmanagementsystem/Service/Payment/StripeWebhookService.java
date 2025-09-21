package com.example.cdr.eventsmanagementsystem.Service.Payment;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.CHECKOUT_SESSION_COMPLETED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.CHECKOUT_SESSION_EXPIRED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_CANCELED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_PAYMENT_FAILED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_REQUIRES_ACTION;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_SUCCEEDED;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus;
import com.example.cdr.eventsmanagementsystem.Util.WebhookHandlerUtil;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.ApiResource;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookService {
    private final StripeService stripeService;
    private final WebhookHandlerUtil webhookHandlerUtil;

    @Value("${app.payment.webhook-secret:}")
    private String webhookSecret;

    public Event constructEvent(String payload, String sigHeader) {
        if (Objects.isNull(webhookSecret) || webhookSecret.isBlank()) {
            throw new IllegalStateException("webhook secret missing");
        }

        try {
            return Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException sve) {
            return ApiResource.GSON.fromJson(payload, Event.class);
        }
    }

    public void processEvent(Event event, BookingType type) {
        switch (event.getType()) {
            case CHECKOUT_SESSION_COMPLETED -> handleCheckoutSessionCompleted(event, type);
            case CHECKOUT_SESSION_EXPIRED -> handleCheckoutSessionExpired(event, type);
            case PAYMENT_INTENT_SUCCEEDED -> handlePaymentIntentSucceeded(event, type);
            case PAYMENT_INTENT_PAYMENT_FAILED -> handlePaymentIntentPaymentFailed(event, type);
            case PAYMENT_INTENT_CANCELED -> handlePaymentIntentCanceled(event, type);
            case PAYMENT_INTENT_REQUIRES_ACTION -> handlePaymentIntentRequiresAction(event, type);
            default -> log.warn("Unhandled event type: " + event.getType());
        }
    }

    private void handleCheckoutSessionCompleted(Event event, BookingType type) {
        webhookHandlerUtil.handleSessionEvent(event, type, (booking, session) -> {
            String paymentIntentId = session.getPaymentIntent();
            if (Objects.nonNull(paymentIntentId)) {
                processBookingWithPaymentIntent(booking, paymentIntentId, session);
            } else {
                processBookingWithoutPaymentIntent(booking, session);
            }
        });
    }

    private void processBookingWithPaymentIntent(Booking booking, String paymentIntentId, Session session) {
        PaymentIntent pi = stripeService.retrievePaymentIntent(paymentIntentId);
        booking.setStripePaymentId(paymentIntentId);
        
        log.info("Processing booking with payment intent - Booking ID: " + booking.getId() + 
                          ", Payment Intent Status: " + pi.getStatus() + 
                          ", Session Payment Status: " + session.getPaymentStatus() + 
                          ", Current Booking Status: " + booking.getStatus());
        
        if ("succeeded".equals(pi.getStatus()) || "paid".equalsIgnoreCase(session.getPaymentStatus())) {
            booking.setPaymentStatus(PaymentStatus.CAPTURED);
            booking.setStatus(BookingStatus.BOOKED);
        } else if ("requires_capture".equals(pi.getStatus())) {
            booking.setPaymentStatus(PaymentStatus.AUTHORIZED);
            booking.setStatus(BookingStatus.BOOKED);
        } else if ("requires_action".equals(pi.getStatus())) {
            booking.setPaymentStatus(PaymentStatus.REQUIRES_ACTION);
            booking.setStatus(BookingStatus.PAYMENT_PENDING);
        }
    }

    private void processBookingWithoutPaymentIntent(Booking booking, Session session) {
        if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
            booking.setPaymentStatus(PaymentStatus.CAPTURED);
            booking.setStatus(BookingStatus.BOOKED);
        }
    }

    private void handlePaymentIntentSucceeded(Event event, BookingType type) {
        webhookHandlerUtil.handlePaymentIntentEvent(event, type, (booking, paymentIntent) -> {
            if (booking.getStatus() != BookingStatus.BOOKED) {
                booking.setPaymentStatus(PaymentStatus.CAPTURED);
                booking.setStatus(BookingStatus.BOOKED);
            }
        });
    }

    private void handleCheckoutSessionExpired(Event event, BookingType type) {
        webhookHandlerUtil.handleSessionEvent(event, type, (booking, session) -> {
            booking.setStatus(BookingStatus.FAILED);
            booking.setPaymentStatus(PaymentStatus.EXPIRED);
        });
    }

    private void handlePaymentIntentPaymentFailed(Event event, BookingType type) {
        webhookHandlerUtil.handlePaymentIntentEvent(event, type, (booking, paymentIntent) -> {
            booking.setStatus(BookingStatus.FAILED);
            booking.setPaymentStatus(PaymentStatus.FAILED);
        });
    }

    private void handlePaymentIntentCanceled(Event event, BookingType type) {
        webhookHandlerUtil.handlePaymentIntentEvent(event, type, (booking, paymentIntent) -> {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setPaymentStatus(PaymentStatus.VOIDED);
        });
    }

    private void handlePaymentIntentRequiresAction(Event event, BookingType type) {
        webhookHandlerUtil.handlePaymentIntentEvent(event, type, (booking, paymentIntent) -> {
            booking.setPaymentStatus(PaymentStatus.REQUIRES_ACTION);
            booking.setStatus(BookingStatus.PAYMENT_PENDING);
        });
    }
}

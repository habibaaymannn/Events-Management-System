package com.example.cdr.eventsmanagementsystem.Service.Payment;

import com.example.cdr.eventsmanagementsystem.Service.Booking.StripeService;
import com.example.cdr.eventsmanagementsystem.Model.Booking.*;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.NotificationUtil;
import com.example.cdr.eventsmanagementsystem.Util.BookingUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.ApiResource;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.CHECKOUT_SESSION_COMPLETED;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.PAYMENT_INTENT_SUCCEEDED;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookService {
    private final StripeService stripeService;
    private final BookingUtil bookingUtil;
    private final NotificationUtil notificationUtil;

    @Value("${app.payment.webhook-secret:}")
    private String webhookSecret;

    public Event constructEvent(String payload, String sigHeader) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
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
            case CHECKOUT_SESSION_COMPLETED:
                handleCheckoutSessionCompleted(event, type);
                break;
            case PAYMENT_INTENT_SUCCEEDED:
                handlePaymentIntentSucceeded(event, type);
                break;
            default:
                break;
        }
    }

    private void handleCheckoutSessionCompleted(Event event, BookingType type) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) return;

        Booking booking = bookingUtil.findBookingByStripeSessionIdAndType(session.getId(), type);
        if (booking == null) return;

        String paymentIntentId = session.getPaymentIntent();
        if (paymentIntentId != null) {
            processBookingWithPaymentIntent(booking, paymentIntentId, session);
        } else {
            processBookingWithoutPaymentIntent(booking, session);
        }
    }

    private void processBookingWithPaymentIntent(Booking booking, String paymentIntentId, Session session) {
        PaymentIntent pi = stripeService.retrievePaymentIntent(paymentIntentId);
        booking.setStripePaymentId(paymentIntentId);
        
        log.info("Processing booking with payment intent - Booking ID: " + booking.getId() + 
                          ", Payment Intent Status: " + pi.getStatus() + 
                          ", Session Payment Status: " + session.getPaymentStatus() + 
                          ", Current Booking Status: " + booking.getStatus());
        
        if ("succeeded".equals(pi.getStatus()) || "paid".equalsIgnoreCase(session.getPaymentStatus())) {
            log.info("Confirming booking - payment succeeded");
            confirmBooking(booking);
        } else if ("requires_capture".equals(pi.getStatus())) {
            log.info("Confirming booking - payment requires capture (authorized)");
            booking.setPaymentStatus(PaymentStatus.AUTHORIZED);
            confirmBooking(booking);
        } else {
            log.info("Saving booking without status change - Payment Intent Status: " + pi.getStatus());
            bookingUtil.saveBooking(booking);
        }
    }

    private void processBookingWithoutPaymentIntent(Booking booking, Session session) {
        if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
            confirmBooking(booking);
        }
    }

    private void handlePaymentIntentSucceeded(Event event, BookingType type) {
        var obj = event.getDataObjectDeserializer().getObject().orElse(null);
        if (!(obj instanceof PaymentIntent paymentIntent)) return;

        Booking booking = bookingUtil.findBookingByStripePaymentIdAndType(paymentIntent.getId(), type);

        if (booking != null && booking.getStatus() != BookingStatus.BOOKED) {
            confirmBooking(booking);
        }
    }

    private void confirmBooking(Booking booking) {
        if (booking.getStatus() != BookingStatus.BOOKED) {
            log.info("Updating booking status from " + booking.getStatus() + " to BOOKED for booking ID: " + booking.getId());
            booking.setStatus(BookingStatus.BOOKED);
            notificationUtil.publishEvent(booking);
        } else {
            log.info("Booking already has BOOKED status for booking ID: " + booking.getId());
        }
    }
}

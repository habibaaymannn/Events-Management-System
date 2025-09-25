package com.example.cdr.eventsmanagementsystem.Service.Payment;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.CHARGE_SUCCEEDED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.CHECKOUT_SESSION_COMPLETED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.CHECKOUT_SESSION_EXPIRED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_CANCELED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_CREATED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_PAYMENT_FAILED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_REQUIRES_ACTION;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_INTENT_SUCCEEDED;
import static com.example.cdr.eventsmanagementsystem.Constants.StripeWebhookConstants.PAYMENT_METHOD_ATTACHED;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus;
import com.example.cdr.eventsmanagementsystem.Util.BookingUtil;
import com.example.cdr.eventsmanagementsystem.Util.WebhookHandlerUtil;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Charge;
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
    private final BookingUtil bookingUtil;

    @Value("${app.payment.webhook-secret:}")
    private String webhookSecret;

    public Event constructEvent(String payload, String sigHeader) {
        if (Objects.isNull(webhookSecret) || webhookSecret.isBlank()) {
            log.warn("Webhook secret missing, skipping signature verification for development");
            return ApiResource.GSON.fromJson(payload, Event.class);
        }

        try {
            return Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException sve) {
            log.warn("Signature verification failed, parsing event without verification: {}", sve.getMessage());
            return ApiResource.GSON.fromJson(payload, Event.class);
        }
    }

    public void processEvent(Event event, BookingType type) {
        BookingType resolvedType = resolveBookingType(event, type);
        if (resolvedType == null) {
            log.warn("Skipping event processing (booking type unresolved). eventId={}, stripeType={}", event.getId(), event.getType());
            return; // Do NOT throw -> avoids 400 from webhook endpoint
        }

        switch (event.getType()) {
            case CHECKOUT_SESSION_COMPLETED -> handleCheckoutSessionCompleted(event, resolvedType);
            case CHECKOUT_SESSION_EXPIRED -> handleCheckoutSessionExpired(event, resolvedType);
            case PAYMENT_INTENT_SUCCEEDED -> handlePaymentIntentSucceeded(event, resolvedType);
            case PAYMENT_INTENT_PAYMENT_FAILED -> handlePaymentIntentPaymentFailed(event, resolvedType);
            case PAYMENT_INTENT_CANCELED -> handlePaymentIntentCanceled(event, resolvedType);
            case PAYMENT_INTENT_REQUIRES_ACTION -> handlePaymentIntentRequiresAction(event, resolvedType);
            case PAYMENT_INTENT_CREATED -> handlePaymentIntentCreated(event, resolvedType);
            case CHARGE_SUCCEEDED -> handleChargeSucceeded(event, resolvedType);
            case PAYMENT_METHOD_ATTACHED -> handlePaymentMethodAttached(event, resolvedType);
            default -> log.warn("Unhandled event type: {}", event.getType());
        }
    }

    private BookingType resolveBookingType(Event event, BookingType explicitType) {
        if (explicitType != null) return explicitType;

        try {
            var obj = event.getDataObjectDeserializer().getObject().orElse(null);

            if (obj instanceof Session session) {
                String bt = session.getMetadata() != null ? session.getMetadata().get("bookingType") : null;
                if (bt != null) return BookingType.valueOf(bt);

                for (BookingType t : BookingType.values()) {
                    var b = bookingUtil.findBookingByStripeSessionIdAndType(session.getId(), t);
                    if (b != null) return t;
                }

                String piId = session.getPaymentIntent();
                if (piId != null) {
                    for (BookingType t : BookingType.values()) {
                        var b = bookingUtil.findBookingByStripePaymentIdAndType(piId, t);
                        if (b != null) return t;
                    }
                }
                return null;
            }

            if (obj instanceof PaymentIntent pi) {
                var md = pi.getMetadata();
                String bt = md != null ? md.get("bookingType") : null;
                if (bt != null) return BookingType.valueOf(bt);

                for (BookingType t : BookingType.values()) {
                    var b = bookingUtil.findBookingByStripePaymentIdAndType(pi.getId(), t);
                    if (b != null) return t;
                }
                return null;
            }

            return null;
        } catch (Exception e) {
            log.warn("Failed resolving booking type: {}", e.getMessage());
            return null;
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

    private void handlePaymentIntentCreated(Event event, BookingType resolvedType) {
        webhookHandlerUtil.handlePaymentIntentEvent(event, resolvedType, (booking, paymentIntent) -> {
            booking.setStripePaymentId(paymentIntent.getId());
            booking.setPaymentStatus(PaymentStatus.PENDING);
        });
    }

    private void handleChargeSucceeded(Event event, BookingType resolvedType) {
        var obj = event.getDataObjectDeserializer().getObject().orElse(null);
        if (!(obj instanceof Charge charge)) return;

        Booking booking = bookingUtil.findBookingByStripePaymentIdAndType(charge.getPaymentIntent(), resolvedType);
        if (Objects.isNull(booking)) {
            log.warn("No booking found for Charge: " + charge.getPaymentIntent());
            return;
        }

        if (booking.getStatus() != BookingStatus.BOOKED || booking.getPaymentStatus() != PaymentStatus.CAPTURED) {
            booking.setPaymentStatus(PaymentStatus.CAPTURED);
            booking.setStatus(BookingStatus.BOOKED);
            bookingUtil.saveBooking(booking);
            log.info("Charge succeeded processed: bookingId={}, paymentIntent={}", booking.getId(), charge.getPaymentIntent());
        }
    }

    private void handlePaymentMethodAttached(Event event, BookingType resolvedType) {
        var obj = event.getDataObjectDeserializer().getObject().orElse(null);
        if (Objects.isNull(obj)) return;

        try {
            String objType = obj.getClass().getSimpleName();
            log.info("payment_method.attached received for type={}, bookingType={} (no-op)", objType, resolvedType);
        } catch (Exception e) {
            log.warn("Failed to log payment_method.attached event: {}", e.getMessage());
        }
    }
}

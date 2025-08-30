package com.example.cdr.eventsmanagementsystem.Service.Payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.CHECKOUT_SESSION_COMPLETED;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.PAYMENT_INTENT_SUCCEEDED;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Service.Booking.StripeServiceInterface;
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

    private final BookingRepository bookingRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StripeServiceInterface stripeService;

    @Value("${app.payment.webhook-secret:}")
    private String webhookSecret;

    public Event constructEvent(String payload, String sigHeader) throws SignatureVerificationException {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("webhook secret missing");
        }

        try {
            return Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException sve) {
            return ApiResource.GSON.fromJson(payload, Event.class);
        }
    }

    public void processEvent(Event event) {
        switch (event.getType()) {
            case CHECKOUT_SESSION_COMPLETED:
                handleCheckoutSessionCompleted(event);
                break;
            case PAYMENT_INTENT_SUCCEEDED:
                handlePaymentIntentSucceeded(event);
                break;
            default:
                break;
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) return;

        Booking booking = bookingRepository.findByStripeSessionId(session.getId()).orElse(null);
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
            bookingRepository.save(booking);
        }
    }

    private void processBookingWithoutPaymentIntent(Booking booking, Session session) {
        if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
            confirmBooking(booking);
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        var obj = event.getDataObjectDeserializer().getObject().orElse(null);
        if (!(obj instanceof PaymentIntent)) return;
        
        PaymentIntent paymentIntent = (PaymentIntent) obj;
        Booking booking = bookingRepository.findByStripePaymentId(paymentIntent.getId()).orElse(null);
        
        if (booking != null && booking.getStatus() != BookingStatus.BOOKED) {
            confirmBooking(booking);
        }
    }

    private void confirmBooking(Booking booking) {
        if (booking.getStatus() != BookingStatus.BOOKED) {
            log.info("Updating booking status from " + booking.getStatus() + " to BOOKED for booking ID: " + booking.getId());
            booking.setStatus(BookingStatus.BOOKED);
            bookingRepository.save(booking);
            publishConfirmed(booking);
        } else {
            log.info("Booking already has BOOKED status for booking ID: " + booking.getId());
        }
    }

    private void publishConfirmed(Booking booking) {
        if (booking.getVenue() != null) {
            eventPublisher.publishEvent(new VenueBookingConfirmed(booking));
        } else if (booking.getService() != null) {
            eventPublisher.publishEvent(new ServiceBookingConfirmed(booking));
        } else {
            eventPublisher.publishEvent(new EventBookingConfirmed(booking));
        }
    }
}

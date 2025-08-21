package com.example.cdr.eventsmanagementsystem.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Service.Booking.StripeServiceInterface;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import static com.stripe.net.ApiResource.GSON;
import com.stripe.net.Webhook;

@RestController
@RequestMapping("/stripe")
@lombok.extern.slf4j.Slf4j
public class StripeWebhookController {

    private final BookingRepository bookingRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StripeServiceInterface stripeService;

    public StripeWebhookController(BookingRepository bookingRepository, ApplicationEventPublisher eventPublisher, StripeServiceInterface stripeService) {
        this.bookingRepository = bookingRepository;
        this.eventPublisher = eventPublisher;
        this.stripeService = stripeService;
    }

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    @Value("${stripe.webhook.skip-verify:}")
    private String skipSignatureVerificationRaw;

    @PostMapping("/webhook")
    public ResponseEntity<String> handle(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            boolean skipSignatureVerification = "true".equalsIgnoreCase(String.valueOf(skipSignatureVerificationRaw).trim());
            Event event;
            try {
                if (skipSignatureVerification) {
                    log.warn("Skipping Stripe signature verification (local/test)");
                    event = GSON.fromJson(payload, Event.class);
                } else {
                    if (webhookSecret == null || webhookSecret.isBlank()) {
                        log.error("Stripe webhook secret is not configured");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("webhook secret missing");
                    }
                    event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
                }
            } catch (SignatureVerificationException sve) {
                if (skipSignatureVerification) {
                    log.warn("Signature verification failed but skipping due to config: {}", sve.getMessage());
                    event = GSON.fromJson(payload, Event.class);
                } else {
                    throw sve;
                }
            }
            log.info("Received Stripe event: {}", event.getType());
            switch (event.getType()) {
                case "checkout.session.completed": {
                    Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (session == null) break;
                    String sessionId = session.getId();
                    Booking booking = bookingRepository.findByStripeSessionId(sessionId).orElse(null);
                    if (booking != null) {
                        String paymentIntentId = session.getPaymentIntent();
                        if (paymentIntentId != null) {
                            var pi = stripeService.retrievePaymentIntent(paymentIntentId); 
                            booking.setStripePaymentId(paymentIntentId);
                            booking.setUpdatedAt(java.time.LocalDateTime.now());
                            
                            if ("succeeded".equals(pi.getStatus())) {
                                booking.setStatus(BookingStatus.BOOKED);
                                bookingRepository.save(booking);
                                publishConfirmed(booking);
                                log.info("Booking {} marked as BOOKED via checkout.session.completed", booking.getId());
                            } else if ("requires_capture".equals(pi.getStatus())) {
                                booking.setStatus(BookingStatus.AUTHORIZED);
                                bookingRepository.save(booking);
                                log.info("Booking {} marked as AUTHORIZED (manual capture)", booking.getId());
                            } else {
                                if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                                    booking.setStatus(BookingStatus.BOOKED);
                                    bookingRepository.save(booking);
                                    publishConfirmed(booking);
                                    log.info("Booking {} marked as BOOKED via session.payment_status=paid", booking.getId());
                                } else {
                                    bookingRepository.save(booking);
                                    log.info("Booking {} payment intent {} saved, status: {}", booking.getId(), paymentIntentId, pi.getStatus());
                                }
                            }
                        } else {
                            if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                                booking.setStatus(BookingStatus.BOOKED);
                                booking.setUpdatedAt(java.time.LocalDateTime.now());
                                bookingRepository.save(booking);
                                publishConfirmed(booking);
                                log.info("Booking {} marked as BOOKED via session.payment_status=paid (no PI)", booking.getId());
                            }
                        }
                    } else {
                        log.warn("No booking found for session ID: {}", sessionId);
                    }
                    break;
                }
                case "payment_intent.succeeded": {
                    var pi = event.getDataObjectDeserializer().getObject().orElse(null);
                    if (pi != null) {
                        com.stripe.model.PaymentIntent paymentIntent = (com.stripe.model.PaymentIntent) pi;
                        Booking booking = bookingRepository.findByStripePaymentId(paymentIntent.getId()).orElse(null);
                        if (booking != null && booking.getStatus() != BookingStatus.BOOKED) {
                            booking.setStatus(BookingStatus.BOOKED);
                            booking.setUpdatedAt(java.time.LocalDateTime.now());
                            bookingRepository.save(booking);
                            publishConfirmed(booking);
                            log.info("Booking {} marked as BOOKED via payment_intent.succeeded", booking.getId());
                        } else if (booking == null) {
                            log.warn("No booking found for payment intent: {}", paymentIntent.getId());
                        }
                    }
                    break;
                }
                default:
                    break;
            }
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Stripe webhook error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("webhook error");
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



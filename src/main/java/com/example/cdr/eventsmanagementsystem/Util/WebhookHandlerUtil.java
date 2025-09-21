package com.example.cdr.eventsmanagementsystem.Util;

import java.util.Objects;
import java.util.function.BiConsumer;

import org.springframework.stereotype.Component;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.NotificationUtil;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for handling Stripe webhook events.
 * Provides generic handlers for common webhook processing patterns.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebhookHandlerUtil {
    
    private final BookingUtil bookingUtil;
    private final NotificationUtil notificationUtil;

    /**
     * Generic handler for PaymentIntent-based webhook events
     * 
     * @param event The Stripe webhook event
     * @param type The booking type (Event, Service, Venue)
     * @param statusUpdater Lambda function to update booking status based on PaymentIntent
     */
    public void handlePaymentIntentEvent(Event event, BookingType type, 
                                       BiConsumer<Booking, PaymentIntent> statusUpdater) {
        var obj = event.getDataObjectDeserializer().getObject().orElse(null);
        if (!(obj instanceof PaymentIntent paymentIntent)) return;

        Booking booking = bookingUtil.findBookingByStripePaymentIdAndType(paymentIntent.getId(), type);
        if (Objects.isNull(booking)) {
            log.warn("No booking found for PaymentIntent: " + paymentIntent.getId());
            return;
        }

        try {
            log.info("Processing PaymentIntent event for booking ID: " + booking.getId() + 
                     ", Payment Intent ID: " + paymentIntent.getId());
            
            statusUpdater.accept(booking, paymentIntent);
            bookingUtil.saveBooking(booking);
            notificationUtil.publishEvent(booking);
            
            log.info("Successfully processed PaymentIntent event for booking: " + booking.getId());
            
        } catch (Exception e) {
            log.error("Failed to process PaymentIntent event for booking: " + booking.getId(), e);
            throw e;
        }
    }

    /**
     * Generic handler for Session-based webhook events
     * 
     * @param event The Stripe webhook event
     * @param type The booking type (Event, Service, Venue)
     * @param statusUpdater Lambda function to update booking status based on Session
     */
    public void handleSessionEvent(Event event, BookingType type, 
                                  BiConsumer<Booking, Session> statusUpdater) {
        var obj = event.getDataObjectDeserializer().getObject().orElse(null);
        if (!(obj instanceof Session session)) return;

        Booking booking = bookingUtil.findBookingByStripeSessionIdAndType(session.getId(), type);
        if (Objects.isNull(booking)) {
            log.warn("No booking found for Session: " + session.getId());
            return;
        }

        try {
            log.info("Processing Session event for booking ID: " + booking.getId() + 
                     ", Session ID: " + session.getId());
            
            statusUpdater.accept(booking, session);
            bookingUtil.saveBooking(booking);
            notificationUtil.publishEvent(booking);
            
            log.info("Successfully processed Session event for booking: " + booking.getId());
            
        } catch (Exception e) {
            log.error("Failed to process Session event for booking: " + booking.getId(), e);
            throw e;
        }
    }
}

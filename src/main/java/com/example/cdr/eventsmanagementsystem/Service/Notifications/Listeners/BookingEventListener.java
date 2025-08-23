package com.example.cdr.eventsmanagementsystem.Service.Notifications.Listeners;

import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.EventBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.ServiceBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.VenueBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.VenueBookingCreated;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.EventBookingCreated;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.ServiceBookingCreated;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.Payment.BookingPaymentFailed;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleEventBookingCreated(EventBookingCreated event) {
        notificationService.sendPaymentRequestEmail(event.booking(), event.booking().getStripePaymentId());
    }

    @EventListener
    public void handleVenueBookingCreated(VenueBookingCreated event) {
        notificationService.sendPaymentRequestEmail(event.booking(), event.booking().getStripePaymentId());
        notificationService.sendVenueBookingEmail(event.booking());
    }

    @EventListener
    public void handleServiceBookingCreated(ServiceBookingCreated event) {
        notificationService.sendPaymentRequestEmail(event.booking(), event.booking().getStripePaymentId());
        notificationService.sendServiceBookingEmail(event.booking());
    }

    @EventListener
    public void handleEventBookingConfirmed(EventBookingConfirmed event) {
        notificationService.sendEventBookingConfirmationEmail(event.booking());
    }

    @EventListener
    public void handleServiceBookingConfirmed(ServiceBookingConfirmed event) {
        notificationService.sendServiceBookingConfirmationEmail(event.booking());
    }

    @EventListener
    public void handleVenueBookingConfirmed(VenueBookingConfirmed event) {
        notificationService.sendVenueBookingConfirmationEmail(event.booking());
    }
    @EventListener
    public void handleEventBookingCancelled(EventBookingCancelled event) {
        notificationService.sendBookingCancellationEmail(event.booking());
    }

    @EventListener
    public void handleServiceBookingCancelled(ServiceBookingCancelled event) {
        notificationService.sendBookingCancellationEmail(event.booking());
        notificationService.sendServiceCancellationEmail(event.booking(), event.reason());
    }

    @EventListener
    public void handleVenueBookingCancelled(VenueBookingCancelled event) {
        notificationService.sendBookingCancellationEmail(event.booking());
        notificationService.sendVenueCancellationEmail(event.booking(), event.reason());
    }

    @EventListener
    public void handleBookingPaymentFailed(BookingPaymentFailed event) {
        notificationService.sendPaymentFailureEmail(event.booking(), event.failureReason());
    }
}
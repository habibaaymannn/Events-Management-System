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
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingUpdates.ServiceBookingUpdate;
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
        notificationService.sendProviderBookingEmail(event.booking(), event.booking().getType());
    }

    @EventListener
    public void handleServiceBookingCreated(ServiceBookingCreated event) {
        notificationService.sendPaymentRequestEmail(event.booking(), event.booking().getStripePaymentId());
        notificationService.sendProviderBookingEmail(event.booking(),event.booking().getType());
    }

    @EventListener
    public void handleProviderServiceBookingConfirmed(ServiceBookingConfirmed event) {
        notificationService.sendProviderConfirmationEmail(event.booking(), event.booking().getType());
    }

    @EventListener
    public void handleProviderVenueBookingConfirmed(VenueBookingConfirmed event) {
        notificationService.sendProviderConfirmationEmail(event.booking(), event.booking().getType());
    }

    @EventListener
    public void handleEventBookingConfirmed(EventBookingConfirmed event) {
        notificationService.sendBookingConfirmationEmail(event.booking());
    }

    @EventListener
    public void handleServiceBookingConfirmed(ServiceBookingConfirmed event) {
        notificationService.sendBookingConfirmationEmail(event.booking());
    }

    @EventListener
    public void handleVenueBookingConfirmed(VenueBookingConfirmed event) {
        notificationService.sendBookingConfirmationEmail(event.booking());
    }

    @EventListener
    public void handleServiceBookingUpdate(ServiceBookingUpdate event) {
        notificationService.sendServiceUpdateEmail(event.booking());
    }

    @EventListener
    public void handleEventBookingCancelled(EventBookingCancelled event) {
        notificationService.sendEventCancellationEmail(event.booking());
        notificationService.sendAttendeeCancellationEmail(event.booking());
    }

    @EventListener
    public void handleServiceBookingCancelled(ServiceBookingCancelled event) {
        notificationService.sendBookingCancellationEmail(event.booking());
        notificationService.sendProviderCancellationEmail(event.booking(), event.reason());
    }

    @EventListener
    public void handleVenueBookingCancelled(VenueBookingCancelled event) {
        notificationService.sendBookingCancellationEmail(event.booking());
        notificationService.sendProviderCancellationEmail(event.booking(), event.reason());
    }

    @EventListener
    public void handleBookingPaymentFailed(BookingPaymentFailed event) {
        notificationService.sendPaymentFailureEmail(event.booking(), event.failureReason());
    }
}
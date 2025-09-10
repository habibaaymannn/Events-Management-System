package com.example.eventsmanagementsystem.Service.Notifications.Listeners;

import com.example.eventsmanagementsystem.NotificationEvent.BookingCancellation.EventBookingCancelled;
import com.example.eventsmanagementsystem.NotificationEvent.BookingCancellation.ServiceBookingCancelled;
import com.example.eventsmanagementsystem.NotificationEvent.BookingCancellation.VenueBookingCancelled;
import com.example.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.eventsmanagementsystem.NotificationEvent.BookingCreation.VenueBookingCreated;
import com.example.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.eventsmanagementsystem.NotificationEvent.BookingCreation.EventBookingCreated;
import com.example.eventsmanagementsystem.NotificationEvent.BookingCreation.ServiceBookingCreated;
import com.example.eventsmanagementsystem.NotificationEvent.BookingUpdates.ServiceBookingUpdate;
import com.example.eventsmanagementsystem.NotificationEvent.Payment.BookingPaymentFailed;
import com.example.eventsmanagementsystem.Service.Notifications.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingEventListener {

    private final EmailNotificationService notificationService;

    @EventListener
    public void handleEventBookingCreated(EventBookingCreated event) {
        notificationService.sendPaymentRequestEmail(event.booking(), event.booking().getStripePaymentId());
    }

    @EventListener
    public void handleVenueBookingCreated(VenueBookingCreated event) {
        notificationService.sendPaymentRequestEmail(event.booking(), event.booking().getStripePaymentId());
        notificationService.sendProviderBookingEmail(event.booking());
    }

    @EventListener
    public void handleServiceBookingCreated(ServiceBookingCreated event) {
        notificationService.sendPaymentRequestEmail(event.booking(), event.booking().getStripePaymentId());
        notificationService.sendProviderBookingEmail(event.booking());
    }

    @EventListener
    public void handleProviderServiceBookingConfirmed(ServiceBookingConfirmed event) {
        notificationService.sendProviderConfirmationEmail(event.booking());
    }

    @EventListener
    public void handleProviderVenueBookingConfirmed(VenueBookingConfirmed event) {
        notificationService.sendProviderConfirmationEmail(event.booking());
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
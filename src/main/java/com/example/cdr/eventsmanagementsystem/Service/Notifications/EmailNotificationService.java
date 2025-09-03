package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService{

    private final AttendeeNotificationService attendeeNotificationService;
    private final PaymentNotificationService paymentNotificationService;
    private final ProviderNotificationService providerNotificationService;
    private final OrganizerNotificationService organizerNotificationService;

    /// Payment
    public void sendPaymentRequestEmail(Booking booking, String clientSecret) {
        // organizer gets email of payment link
        paymentNotificationService.sendPaymentRequestEmail(booking, clientSecret);
    }
    public void sendPaymentFailureEmail(Booking booking, String failureReason) {
        // organizer gets email of payment failure
       paymentNotificationService.sendPaymentFailureEmail(booking, failureReason);
    }

    /// providers
    public void sendProviderBookingEmail(Booking booking) {
        // Notify providers (new booking)
        providerNotificationService.sendNewBookingRequestEmail(booking);
    }
    public void sendProviderConfirmationEmail(Booking booking){
        // Notify providers of booking confirmation
        providerNotificationService.sendBookingConfirmationEmail(booking);
    }
    public void sendProviderCancellationEmail(Booking booking, String reason) {
        // Notify providers of booking cancellation
        providerNotificationService.sendBookingCancellationEmail(booking, reason);
    }

    /// organizer
    public void sendBookingConfirmationEmail(Booking booking){
        organizerNotificationService.sendBookingConfirmationEmail(booking);
    }
    public void sendServiceUpdateEmail(Booking booking) {
        // notify organizer the status update(accept/reject)
        organizerNotificationService.sendServiceBookingUpdateEmail(booking);
    }
    public void sendBookingCancellationEmail(Booking booking) {
        // notify organizer when their venue/service booking is cancelled
        organizerNotificationService.sendBookingCancellationEmail(booking);
    }
    public void sendEventCancellationEmail(EventBooking booking) {
        // notify organizer when event is cancelled
        organizerNotificationService.sendEventCancellationEmail(booking);
    }

    /// attendee
    public void sendAttendeeCancellationEmail(EventBooking booking) {
        attendeeNotificationService.sendBookingCancellationEmail(booking);
    }
}


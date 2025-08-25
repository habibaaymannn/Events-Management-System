package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import org.springframework.stereotype.Service;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService implements NotificationService {

    private final EventNotificationService eventNotificationService;
    private final VenueNotificationService venueNotificationService;
    private final ServiceNotificationService serviceNotificationService;
    private final PaymentNotificationService paymentNotificationService;

    /// Payment
    @Override
    public void sendPaymentRequestEmail(Booking booking, String clientSecret) {
        // organizer gets email of payment link
        paymentNotificationService.sendPaymentRequestEmail(booking, clientSecret);
    }
    @Override
    public void sendPaymentFailureEmail(Booking booking, String failureReason) {
        // organizer gets email of payment failure
       paymentNotificationService.sendPaymentFailureEmail(booking, failureReason);
    }

    /// venue
    @Override
    public void sendVenueBookingEmail(Booking booking) {
        // Notify venue provider (new booking)
        venueNotificationService.sendVenueBookingEmail(booking);
    }
    @Override
    public void sendVenueBookingConfirmationEmail(Booking booking) {
        // confirm to organizer
        venueNotificationService.sendVenueBookingConfirmationEmail(booking);
    }
    @Override
    public void sendVenueCancellationEmail(Booking booking,String reason) {
        // notify venue provider
        venueNotificationService.sendVenueCancellationEmail(booking, reason);
    }

    /// service
    @Override
    public void sendServiceBookingEmail(Booking booking) {
        // Notify service provider of a new booking request
        serviceNotificationService.sendServiceBookingEmail(booking);
    }
    @Override
    public void sendServiceBookingConfirmationEmail(Booking booking) {
        // confirm to organizer
        serviceNotificationService.sendServiceBookingConfirmationEmail(booking);
    }
    @Override
    public void sendServiceCancellationEmail(Booking booking,String reason) {
        // Notify service provider
        serviceNotificationService.sendServiceCancellationEmail(booking, reason);}

    @Override
    public void sendServiceUpdateEmail(Booking booking) {
        // notify organizer the status update(accept/reject)
        serviceNotificationService.sendServiceBookingUpdateEmail(booking);
    }

    /// event
    @Override
    public void sendEventBookingConfirmationEmail(Booking booking) {
        // notify organizer
        eventNotificationService.sendEventBookingConfirmationEmail(booking);}

    @Override
    public void sendBookingCancellationEmail(Booking booking) {
        // notify organizer when their booking is cancelled
        eventNotificationService.sendBookingCancellationEmail(booking);
    }
}


package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import org.springframework.stereotype.Service;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService implements NotificationService {

    private final AttendeeNotificationService attendeeNotificationService;
    private final PaymentNotificationService paymentNotificationService;
    private final ProviderNotificationService providerNotificationService;
    private final OrganizerNotificationService organizerNotificationService;

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

    /// providers
    @Override
    public void sendProviderBookingEmail(Booking booking, BookingType bookingType) {
        // Notify providers (new booking)
        providerNotificationService.sendNewBookingRequestEmail(booking,BookingType.VENUE);
        providerNotificationService.sendNewBookingRequestEmail(booking,BookingType.SERVICE);
    }
    @Override
    public void sendProviderConfirmationEmail(Booking booking, BookingType bookingType){
        // Notify providers of booking confirmation
        providerNotificationService.sendBookingConfirmationEmail(booking,BookingType.VENUE);
        providerNotificationService.sendBookingConfirmationEmail(booking,BookingType.SERVICE);
    }
    @Override
    public void sendProviderCancellationEmail(Booking booking, String reason) {
        // Notify providers of booking cancellation
        providerNotificationService.sendBookingCancellationEmail(booking,BookingType.VENUE, reason);
        providerNotificationService.sendBookingCancellationEmail(booking, BookingType.SERVICE,reason);
    }

    /// organizer
    @Override
    public void sendBookingConfirmationEmail(Booking booking){
        organizerNotificationService.sendBookingConfirmationEmail(booking);
    }
    @Override
    public void sendServiceUpdateEmail(Booking booking) {
        // notify organizer the status update(accept/reject)
        organizerNotificationService.sendServiceBookingUpdateEmail(booking);
    }
    @Override
    public void sendBookingCancellationEmail(Booking booking) {
        // notify organizer when their venue/service booking is cancelled
        organizerNotificationService.sendBookingCancellationEmail(booking);
    }
    @Override
    public void sendEventCancellationEmail(Booking booking) {
        // notify organizer when event is cancelled
        organizerNotificationService.sendEventCancellationEmail(booking);
    }

    /// attendee
    @Override
    public void sendAttendeeCancellationEmail(Booking booking) {
        attendeeNotificationService.sendBookingCancellationEmail(booking);
    }
}


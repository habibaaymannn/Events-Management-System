package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;

public interface NotificationService {
    void sendPaymentRequestEmail(Booking booking, String clientSecret);
    void sendPaymentFailureEmail(Booking booking, String failureReason);

    //attendee
    void sendAttendeeCancellationEmail(EventBooking booking);

    //organizer
    void sendBookingConfirmationEmail(Booking booking);
    void sendServiceUpdateEmail(Booking booking);
    void sendBookingCancellationEmail(Booking booking);
    void sendEventCancellationEmail(EventBooking booking);

    //providers notifications
    void sendProviderBookingEmail(Booking booking);
    void sendProviderConfirmationEmail(Booking booking);
    void sendProviderCancellationEmail(Booking booking, String reason);
}
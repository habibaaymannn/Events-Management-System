package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

public interface NotificationService {
    void sendPaymentRequestEmail(Booking booking, String clientSecret);
    void sendPaymentFailureEmail(Booking booking, String failureReason);

    void sendEventBookingConfirmationEmail(Booking booking);
    void sendBookingCancellationEmail(Booking booking);

    void sendVenueBookingEmail(Booking booking);
    void sendVenueBookingConfirmationEmail(Booking booking);
    void sendVenueCancellationEmail(Booking booking, String reason);

    void sendServiceBookingEmail(Booking booking);
    void sendServiceBookingConfirmationEmail(Booking booking);
    void sendServiceCancellationEmail(Booking booking, String reason);
}
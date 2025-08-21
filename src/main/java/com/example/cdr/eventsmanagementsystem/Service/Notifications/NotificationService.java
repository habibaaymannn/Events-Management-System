package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

public interface NotificationService {
    void sendPaymentRequestEmail(Booking booking, String paymentUrl);
    void sendEventBookingConfirmationEmail(Booking booking);
    void sendVenueBookingConfirmationEmail(Booking booking);
    void sendServiceBookingConfirmationEmail(Booking booking);
    void sendBookingCancellationEmail(Booking booking);
    void sendPaymentFailureEmail(Booking booking, String failureReason);
    void sendVenueBookingEmail(Booking booking);
    void sendVenueCancellationEmail(Booking booking, String reason);
    void sendServiceBookingEmail(Booking booking);
    void sendServiceCancellationEmail(Booking booking, String reason);
    void sendEmail(String to, String subject, String content);
}

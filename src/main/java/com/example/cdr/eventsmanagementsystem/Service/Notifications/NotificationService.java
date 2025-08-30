package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;

public interface NotificationService {
    void sendPaymentRequestEmail(Booking booking, String clientSecret);
    void sendPaymentFailureEmail(Booking booking, String failureReason);

    //attendee
    void sendAttendeeCancellationEmail(Booking booking);

    //organizer
    void sendBookingConfirmationEmail(Booking booking);
    void sendServiceUpdateEmail(Booking booking);
    void sendBookingCancellationEmail(Booking booking);
    void sendEventCancellationEmail(Booking booking);

    //providers notifications
    void sendProviderBookingEmail(Booking booking, BookingType bookingType);
    void sendProviderConfirmationEmail(Booking booking, BookingType bookingType);
    void sendProviderCancellationEmail(Booking booking, String reason);
}
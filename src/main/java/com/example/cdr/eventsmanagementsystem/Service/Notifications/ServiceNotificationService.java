package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.Helper.NotificationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ServiceNotificationService {
    private final NotificationHelper notificationHelper;

    public void sendServiceBookingEmail(Booking booking) {
        // Notify service provider of a new booking request
        notificationHelper.sendProviderBookingNotification(booking, BookingType.SERVICE, "service");
    }
    public void sendServiceBookingConfirmationEmail(Booking booking) {
        // confirm to organizer
        notificationHelper.sendBookingConfirmation(booking, "Service");
    }
    public void sendServiceCancellationEmail(Booking booking,String reason) {
        // Notify service provider
        notificationHelper.sendProviderCancellationNotification(booking, BookingType.SERVICE, "service", reason);
    }
}

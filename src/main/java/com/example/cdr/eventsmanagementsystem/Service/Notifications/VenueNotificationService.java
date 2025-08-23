package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.Helper.NotificationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VenueNotificationService {
    private final NotificationHelper notificationHelper;
    public void sendVenueBookingEmail(Booking booking) {
        // Notify venue provider (new booking)
        notificationHelper.sendProviderBookingNotification(booking, BookingType.VENUE, "venue");
    }
    public void sendVenueBookingConfirmationEmail(Booking booking) {
        // confirm to organizer
        notificationHelper.sendBookingConfirmation(booking, "Venue");
    }
    public void sendVenueCancellationEmail(Booking booking,String reason) {
        // notify venue provider
        notificationHelper.sendProviderCancellationNotification(booking, BookingType.VENUE, "venue", reason);
    }
}

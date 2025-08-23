package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailMessages;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.Helper.NotificationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EventNotificationService {
    private final NotificationHelper notificationHelper;
    private final NotificationChannel emailNotification;

    public void sendEventBookingConfirmationEmail(Booking booking) {
        // notify organizer
        notificationHelper.sendBookingConfirmation(booking, "Event");
    }


    public void sendBookingCancellationEmail(Booking booking) {
        // notify organizer when their booking is cancelled
        BaseRoleEntity booker = notificationHelper.getUser(booking.getBookerId(), "booking cancellation", booking.getId());
        if (Objects.isNull(booker)) return;

        String content = String.format(EmailMessages.BOOKING_CANCELLED,
                booker.getFirstName(), booking.getId());

        emailNotification.send(booker.getEmail(), String.format("Booking Cancelled #" + booking.getId()), content);
    }
}

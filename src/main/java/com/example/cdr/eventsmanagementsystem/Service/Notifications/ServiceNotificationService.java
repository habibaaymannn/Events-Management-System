package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailMessages;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.Helper.NotificationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Slf4j
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
    public void sendServiceBookingUpdateEmail(Booking booking) {
        BaseRoleEntity organizer = notificationHelper.getUser(
                booking.getBookerId(), "service response", booking.getId());
        BaseRoleEntity provider = notificationHelper.getProvider(booking, BookingType.SERVICE);

        String content = String.format(
                EmailMessages.SERVICE_STATUS_UPDATE,
                organizer.getFirstName(),
                booking.getId(),
                booking.getStatus(),
                provider.getFirstName()
        );
        notificationHelper.send(organizer.getEmail(), "Service Booking Update", content);

    }
}

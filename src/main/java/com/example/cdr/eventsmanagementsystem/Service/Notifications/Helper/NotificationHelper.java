package com.example.cdr.eventsmanagementsystem.Service.Notifications.Helper;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserRoleHandler;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationHelper {
    private final UserSyncService userSyncService;
    private final JavaMailSender mailSender;

    public BaseRoleEntity getProvider(Booking booking, BookingType bookingType) {
        return switch (bookingType) {
            case VENUE -> booking.getVenue() != null ? booking.getVenue().getVenueProvider() : null;
            case SERVICE -> booking.getService() != null ? booking.getService().getServiceProvider() : null;
            default -> null;
        };
    }
    private String getResourceName(Booking booking, BookingType bookingType) {
        return switch (bookingType) {
            case VENUE -> booking.getVenue() != null ? booking.getVenue().getName() : "Unknown Venue";
            case SERVICE -> booking.getService() != null ? booking.getService().getName() : "Unknown Service";
            default -> "Unknown Resource";
        };
    }
    public BaseRoleEntity getUser(String userId, String context, Long bookingId) {
        for (UserRoleHandler<?> handler : userSyncService.getHandlers()) {
            BaseRoleEntity user = handler.findUserById(userId);
            if (user != null) {
                return user;
            }
        }
        log.error("User not found for {}: booking {}", context, bookingId);
        return null;
    }
    public void sendBookingConfirmation(Booking booking, String bookingTypeName) {
        BaseRoleEntity booker = getUser(booking.getBookerId(), "confirmation", booking.getId());
        if (Objects.isNull(booker)) return;

        String content = String.format(EmailMessages.BOOKING_CONFIRMED,
                booker.getFirstName(), bookingTypeName, booking.getId(), booking.getStripePaymentId());

        send(booker.getEmail(),
                "Booking Confirmed #" + booking.getId(), content);

    }

    public void sendProviderBookingNotification(Booking booking, BookingType bookingType, String resourceType) {
        BaseRoleEntity provider = getProvider(booking, bookingType);
        BaseRoleEntity booker = getUser(booking.getBookerId(), "booking notification", booking.getId());

        if (Objects.isNull(provider) || Objects.isNull(booker)) return;

        String resourceName = getResourceName(booking, bookingType);
        String content = String.format(EmailMessages.NEW_BOOKING_REQUEST,
                provider.getFirstName(), resourceType, resourceName, booking.getId(),
                booking.getStartTime(), booking.getEndTime(), booker.getFirstName());

        send(provider.getEmail(),
                "New Booking Request for Your " + resourceType.substring(0, 1).toUpperCase() + resourceType.substring(1),
                content);
    }

    public void sendProviderCancellationNotification(Booking booking, BookingType bookingType, String resourceType, String reason) {
        BaseRoleEntity provider = getProvider(booking, bookingType);
        BaseRoleEntity booker = getUser(booking.getBookerId(), "cancellation notification", booking.getId());

        if (Objects.isNull(provider) || Objects.isNull(booker)) return;

        String resourceName = getResourceName(booking, bookingType);
        String content = String.format(EmailMessages.PROVIDER_CANCELLATION,
                provider.getFirstName(), resourceType, resourceName, booking.getId(),
                booking.getStartTime(), booking.getEndTime(), booker.getFullName(),
                booker.getEmail(), reason);

        send(provider.getEmail(),
                "Booking Cancelled for Your " + resourceType.substring(0, 1).toUpperCase() + resourceType.substring(1),
                content);

    }
    public void send(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
    }
}

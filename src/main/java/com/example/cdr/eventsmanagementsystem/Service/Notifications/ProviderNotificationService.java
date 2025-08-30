package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailConstants;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProviderNotificationService {
    private final NotificationUtil notificationUtil;

    public void sendNewBookingRequestEmail(Booking booking, BookingType type) {
        sendProviderEmail(booking, type,EmailConstants.NEW_BOOKING_REQUEST, "New Booking Request", "booking notification");
    }
    public void sendBookingConfirmationEmail(Booking booking, BookingType type) {
        sendProviderEmail(booking, type,EmailConstants.PROVIDER_CONFIRMATION, "Booking Confirmed", "booking notification");
    }

    public void sendBookingCancellationEmail(Booking booking, BookingType type, String reason) {
        sendProviderEmail(booking, type,EmailConstants.PROVIDER_CANCELLATION, "Booking Cancelled", "cancellation notification", reason);
    }
    private void sendProviderEmail(Booking booking, BookingType type, String template, String subjectPrefix, String context, String... extraArgs) {
        String resourceType = type.name().toLowerCase();
        BaseRoleEntity provider = notificationUtil.getProvider(booking, type);
        BaseRoleEntity booker = notificationUtil.getUser(booking.getBookerId(), context, booking.getId());

        if (Objects.isNull(provider) || Objects.isNull(booker)) return;

        String resourceName = notificationUtil.getResourceName(booking, type);
        String subject = subjectPrefix + " for Your " + Character.toUpperCase(resourceType.charAt(0)) + resourceType.substring(1);

        String content = switch (template) {
            case EmailConstants.NEW_BOOKING_REQUEST -> String.format(template,
                    provider.getFirstName(), resourceType, resourceName, booking.getId(),
                    booking.getStartTime(), booking.getEndTime(), booker.getFirstName());

            case EmailConstants.PROVIDER_CONFIRMATION -> String.format(template,
                    provider.getFirstName(), resourceType, resourceName, booking.getId(),
                    booker.getFirstName());

            case EmailConstants.PROVIDER_CANCELLATION -> String.format(template,
                    provider.getFirstName(), resourceType, resourceName, booking.getId(),
                    booking.getStartTime(), booking.getEndTime(), booker.getFullName(),
                    booker.getEmail(), extraArgs.length > 0 ? extraArgs[0] : "");

            default -> "";
        };
        notificationUtil.send(provider.getEmail(), subject, content);
    }

}

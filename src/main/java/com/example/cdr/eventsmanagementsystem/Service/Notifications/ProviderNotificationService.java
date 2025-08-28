package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailConstants;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.example.cdr.eventsmanagementsystem.Util.BookingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProviderNotificationService {
    private final NotificationUtil notificationUtil;
    private final BookingUtil bookingUtil;
    private final AuthUtil authUtil;

    public void sendNewBookingRequestEmail(Booking booking) {
        sendProviderEmail(booking, EmailConstants.NEW_BOOKING_REQUEST, "New Booking Request", "booking notification");
    }
    public void sendBookingConfirmationEmail(Booking booking) {
        sendProviderEmail(booking, EmailConstants.PROVIDER_CONFIRMATION, "Booking Confirmed", "booking notification");
    }

    public void sendBookingCancellationEmail(Booking booking, String reason) {
        sendProviderEmail(booking, EmailConstants.PROVIDER_CANCELLATION, "Booking Cancelled", "cancellation notification", reason);
    }
    private void sendProviderEmail(Booking booking, String template, String subjectPrefix, String context, String... extraArgs) {
        String resourceType = bookingUtil.getResourceType(booking).toLowerCase();
        BaseRoleEntity provider = authUtil.getProvider(booking);
        BaseRoleEntity booker = authUtil.getUser(booking.getCreatedBy());

        if (Objects.isNull(provider) || Objects.isNull(booker)) return;

        String resourceName = bookingUtil.getResourceName(booking);
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

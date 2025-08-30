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
public class OrganizerNotificationService {
    private final NotificationUtil notificationUtil;

    public void sendBookingConfirmationEmail(Booking booking) {
        String bookingTypeName = booking.getType().name().toLowerCase();
        BaseRoleEntity booker = notificationUtil.getUser(booking.getBookerId(), "confirmation", booking.getId());
        if (Objects.isNull(booker)) return;

        String content = String.format(EmailConstants.BOOKING_CONFIRMED,
                booker.getFirstName(), bookingTypeName, booking.getId(), booking.getStripePaymentId());

        notificationUtil.send(booker.getEmail(), "Booking Confirmed #" + booking.getId(), content);
    }
    public void sendServiceBookingUpdateEmail(Booking booking) {
        // notify organizer with service update(accept/reject)
        BaseRoleEntity organizer = notificationUtil.getUser(booking.getBookerId(), "service response", booking.getId());
        BaseRoleEntity provider = notificationUtil.getProvider(booking, BookingType.SERVICE);

        String content = String.format(
                EmailConstants.SERVICE_STATUS_UPDATE,
                organizer.getFirstName(),
                booking.getId(),
                booking.getStatus(),
                provider.getFirstName()
        );
        notificationUtil.send(organizer.getEmail(), "Service Booking Update", content);
    }
    public void sendBookingCancellationEmail(Booking booking) {
        BaseRoleEntity organizer = notificationUtil.getUser(booking.getBookerId(), "booking cancellation", booking.getId());
        if (Objects.nonNull(organizer)) {
            String content = String.format(EmailConstants.BOOKING_CANCELLED, organizer.getFirstName(), booking.getId());
            notificationUtil.send(organizer.getEmail(), "Booking Cancelled #" + booking.getId(), content);
        }
    }
    public void sendEventCancellationEmail(Booking booking) {
        // Get the event organizer
        if (Objects.nonNull(booking.getEvent()) && Objects.nonNull(booking.getEvent().getOrganizer().getId())) {
            BaseRoleEntity organizer = notificationUtil.getUser(booking.getEvent().getOrganizer().getId(), "event cancellation", booking.getId());
            if (Objects.nonNull(organizer)) {
                String content = String.format( Objects.equals(booking.getCancelledBy(), booking.getEvent().getOrganizer().getId())
                                ? EmailConstants.EVENT_CANCELLED
                                : EmailConstants.ATTENDEE_CANCELLED_BOOKING, organizer.getFirstName(), booking.getEvent().getName(),
                        booking.getId());
                notificationUtil.send(organizer.getEmail(), "Event Cancelled #" + booking.getId(), content);
            }
        }
    }
}
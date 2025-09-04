package com.example.eventsmanagementsystem.Service.Notifications;

import com.example.eventsmanagementsystem.Constants.NotificationConstants.EmailConstants;
import com.example.eventsmanagementsystem.Model.Booking.Booking;
import com.example.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.eventsmanagementsystem.Model.Event.Event;
import com.example.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.eventsmanagementsystem.Model.User.Organizer;
import com.example.eventsmanagementsystem.Repository.EventRepository;
import com.example.eventsmanagementsystem.Util.AuthUtil;
import com.example.eventsmanagementsystem.Util.BookingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrganizerNotificationService {
    private final EventRepository eventRepository;
    private final NotificationUtil notificationUtil;
    private final BookingUtil bookingUtil;
    private final AuthUtil authUtil;

    public void sendBookingConfirmationEmail(Booking booking) {
        String resourceType = bookingUtil.getResourceType(booking).toLowerCase();
        BaseRoleEntity booker = authUtil.getUser(booking.getCreatedBy());
        if (Objects.isNull(booker)) return;

        String content = String.format(EmailConstants.BOOKING_CONFIRMED,
                booker.getFirstName(), resourceType, booking.getId(), booking.getStripePaymentId());

        notificationUtil.send(booker.getEmail(), "Booking Confirmed #" + booking.getId(), content);
    }
    public void sendServiceBookingUpdateEmail(Booking booking) {
        // notify organizer with service update(accept/reject)
        BaseRoleEntity organizer = authUtil.getUser(booking.getCreatedBy());
        BaseRoleEntity provider = authUtil.getProvider(booking);

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
        BaseRoleEntity organizer = authUtil.getUser(booking.getCreatedBy());
        if (Objects.nonNull(organizer)) {
            String content = String.format(EmailConstants.BOOKING_CANCELLED, organizer.getFirstName(), booking.getId());
            notificationUtil.send(organizer.getEmail(), "Booking Cancelled #" + booking.getId(), content);
        }
    }

    public void sendEventCancellationEmail(EventBooking booking) {
        Organizer organizer = eventRepository.findById(booking.getEventId()).map(Event::getOrganizer).orElse(null);
        if (Objects.isNull(organizer)) return;

        boolean cancelledByOrganizer = Objects.equals(booking.getCancelledBy(), organizer.getId());
        String emailTemplate = cancelledByOrganizer ? EmailConstants.EVENT_CANCELLED : EmailConstants.ATTENDEE_CANCELLED_BOOKING;
        String eventName = eventRepository.findById(booking.getEventId()).map(Event::getName).orElse("Unknown Event");
        String content = String.format(emailTemplate, organizer.getFirstName(), eventName, booking.getId());

        notificationUtil.send(organizer.getEmail(), "Event Cancelled #" + booking.getId(), content);
    }
}
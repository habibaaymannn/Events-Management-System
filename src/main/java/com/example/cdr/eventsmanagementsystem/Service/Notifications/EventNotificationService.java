package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookerType;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailMessages;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.Helper.NotificationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EventNotificationService {
    private final NotificationHelper notificationHelper;
    private final BookingRepository bookingRepository;

    public void sendEventBookingConfirmationEmail(Booking booking) {
        // notify organizer
        notificationHelper.sendBookingConfirmation(booking, "Event");
    }

    public void sendBookingCancellationEmail(Booking booking) {
        String cancelledBy = booking.getCancelledBy();
        // Organizer cancelled -> notify attendees
        if (booking.getBookerType() == BookerType.ORGANIZER && Objects.equals(cancelledBy, booking.getBookerId()) && Objects.nonNull(booking.getEvent())) {
            List<Booking> attendeeBookings = bookingRepository.findByEventIdAndBookerType(booking.getEvent().getId(), BookerType.ATTENDEE);

            for (Booking attendeeBooking : attendeeBookings) {
                BaseRoleEntity attendee = notificationHelper.getUser(attendeeBooking.getBookerId(), "booking cancellation", attendeeBooking.getId());

                if (Objects.nonNull(attendee)) {
                    String content = String.format(EmailMessages.BOOKING_CANCELLED, attendee.getFirstName(), booking.getId());
                    notificationHelper.send(attendee.getEmail(), "Booking Cancelled #" + booking.getId(), content);
                }
            }
        }
        // Provider cancelled -> notify organizer
        else if (!Objects.equals(cancelledBy, booking.getBookerId())) {
            BaseRoleEntity organizer = notificationHelper.getUser(booking.getBookerId(), "booking cancellation", booking.getId());
            if (Objects.nonNull(organizer)) {
                String content = String.format(EmailMessages.BOOKING_CANCELLED, organizer.getFirstName(), booking.getId());
                notificationHelper.send(organizer.getEmail(), "Booking Cancelled #" + booking.getId(), content);
            }
        }
        // notify booker when their booking is cancelled
        BaseRoleEntity booker = notificationHelper.getUser(booking.getBookerId(), "booking cancellation", booking.getId());
        if (Objects.isNull(booker)) return;

        String content = String.format(EmailMessages.BOOKING_CANCELLED, booker.getFirstName(), booking.getId());
        notificationHelper.send(booker.getEmail(), String.format("Booking Cancelled #" + booking.getId()), content);
    }
    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void sendUpcomingEventReminders() {
        // fetch bookings 24–25 hours from now
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.plusHours(24);
        LocalDateTime end = now.plusHours(25);

        List<Booking> bookings = bookingRepository.findUpcomingBookings(BookingStatus.BOOKED, start, end);

        for (Booking booking : bookings) {
            sendEventReminderEmail(booking);
            booking.setEmailSent(true);
            bookingRepository.save(booking);
        }
    }

    public void sendEventReminderEmail(Booking booking) {
        Event event = booking.getEvent();
        BaseRoleEntity attendee = notificationHelper.getUser(booking.getBookerId(), "reminder", booking.getId());

        String content = String.format(
                EmailMessages.EVENT_REMINDER,
                attendee.getFirstName(),
                event.getName(),
                event.getStartTime().format(DateTimeFormatter.ofPattern("EEEE, MMM dd yyyy 'at' hh:mm a"))
        );
        notificationHelper.send(attendee.getEmail(), "Event Reminder #" + booking.getId(), content);
    }
}

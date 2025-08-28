package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookerType;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailConstants;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AttendeeNotificationService {
    private final NotificationUtil notificationUtil;
    private final BookingRepository bookingRepository;

    public void sendBookingCancellationEmail(Booking booking) {
        String cancelledBy = booking.getCancelledBy();
        // case 1: Organizer cancels the event - notify all attendees
        if (Objects.nonNull(booking.getEvent()) && Objects.equals(cancelledBy, booking.getEvent().getOrganizer().getId())) {
            List<Booking> attendeeBookings = bookingRepository.findByEventIdAndBookerType(booking.getEvent().getId(), BookerType.ATTENDEE);

            for (Booking attendeeBooking : attendeeBookings) {
                BaseRoleEntity attendee = notificationUtil.getUser(attendeeBooking.getBookerId(), "event cancellation", attendeeBooking.getId());

                if (Objects.nonNull(attendee)) {
                    String content = String.format(EmailConstants.BOOKING_CANCELLED, attendee.getFirstName(), booking.getId());
                    notificationUtil.send(attendee.getEmail(), "Event Cancelled: " + booking.getEvent().getName(), content);
                }
            }
        }
        // case 2: Attendee cancels their own booking - notify that attendee
        else if (booking.getBookerType() == BookerType.ATTENDEE && Objects.equals(cancelledBy, booking.getBookerId())) {
            BaseRoleEntity attendee = notificationUtil.getUser(booking.getBookerId(), "booking cancellation", booking.getId());
            if (Objects.nonNull(attendee)) {
                String content = String.format(EmailConstants.BOOKING_CANCELLED, attendee.getFirstName(), booking.getId());
                notificationUtil.send(attendee.getEmail(), "Booking Cancelled #" + booking.getId(), content);
            }
        }
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
        BaseRoleEntity attendee = notificationUtil.getUser(booking.getBookerId(), "reminder", booking.getId());

        String content = String.format(
                EmailConstants.EVENT_REMINDER,
                attendee.getFirstName(),
                event.getName(),
                event.getStartTime().format(DateTimeFormatter.ofPattern("EEEE, MMM dd yyyy 'at' hh:mm a"))
        );
        notificationUtil.send(attendee.getEmail(), "Event Reminder #" + booking.getId(), content);
    }
}

package com.example.eventsmanagementsystem.Service.Notifications;

import com.example.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.eventsmanagementsystem.Model.Event.Event;
import com.example.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.eventsmanagementsystem.Constants.NotificationConstants.EmailConstants;
import com.example.eventsmanagementsystem.Model.User.Organizer;
import com.example.eventsmanagementsystem.Repository.EventBookingRepository;
import com.example.eventsmanagementsystem.Repository.EventRepository;
import com.example.eventsmanagementsystem.Util.AuthUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AttendeeNotificationService {
    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final NotificationUtil notificationUtil;
    private final AuthUtil authUtil;

    public void sendBookingCancellationEmail(EventBooking eventBooking) {
        String cancelledBy = eventBooking.getCancelledBy();
        Organizer organizer = eventRepository.findById(eventBooking.getEventId()).map(Event::getOrganizer).orElseThrow(() -> new EntityNotFoundException("Event not found"));
        if (Objects.equals(cancelledBy, organizer.getId())) {
            // Case 1: Organizer cancels the event - notify all attendees
            List<EventBooking> attendeeBookings = bookingRepository.findByEventId(eventBooking.getEventId());
            for (EventBooking attendeeBooking : attendeeBookings) {
                BaseRoleEntity attendee = authUtil.getUser(attendeeBooking.getCreatedBy());
                String content = String.format(EmailConstants.BOOKING_CANCELLED, attendee.getFirstName(), eventBooking.getId());
                String name = eventRepository.findById(eventBooking.getEventId()).map(Event::getName).orElse("Unknown Event");
                notificationUtil.send(attendee.getEmail(), "Event Cancelled: " + name, content);
            }
        } else if (Objects.equals(cancelledBy, eventBooking.getCreatedBy())) {
            // Case 2: Attendee cancels their own booking - notify that attendee
            BaseRoleEntity attendee = authUtil.getUser(eventBooking.getCreatedBy());
            String content = String.format(EmailConstants.BOOKING_CANCELLED, attendee.getFirstName(), eventBooking.getId());
            notificationUtil.send(attendee.getEmail(), "Booking Cancelled #" + eventBooking.getId(), content);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void sendUpcomingEventReminders() {

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime startOfDay = tomorrow.atStartOfDay();
        LocalDateTime endOfDay = tomorrow.atTime(23, 59, 59);

        List<EventBooking> bookings = bookingRepository.findByStatusAndStartTimeBetween(BookingStatus.BOOKED, startOfDay, endOfDay);

        for (EventBooking booking : bookings) {
            sendEventReminderEmail(booking);
        }
    }

    public void sendEventReminderEmail(EventBooking booking) {
        Event event = eventRepository.findById(booking.getEventId()).orElseThrow(() -> new EntityNotFoundException("Event not found"));
        BaseRoleEntity attendee = authUtil.getUser(booking.getCreatedBy());

        String content = String.format(
                EmailConstants.EVENT_REMINDER,
                attendee.getFirstName(),
                event.getName(),
                event.getStartTime().format(DateTimeFormatter.ofPattern("EEEE, MMM dd yyyy 'at' hh:mm a"))
        );
        notificationUtil.send(attendee.getEmail(), "Event Reminder #" + booking.getId(), content);
    }
}

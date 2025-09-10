package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationUtil {
    private final JavaMailSender mailSender;
    private final ApplicationEventPublisher eventPublisher;

    public void publishEvent(Booking booking) {
        switch (booking) {
            case EventBooking eventBooking ->
                    eventPublisher.publishEvent(new EventBookingConfirmed(eventBooking));
            case VenueBooking venueBooking ->
                    eventPublisher.publishEvent(new VenueBookingConfirmed(venueBooking));
            case ServiceBooking serviceBooking ->
                    eventPublisher.publishEvent(new ServiceBookingConfirmed(serviceBooking));
            default -> {
                    throw new IllegalStateException("Unexpected type: " + booking);
            }
        }
    }

    public void send(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
    }
}

package com.example.cdr.eventsmanagementsystem.Service.Venue.Notifications;

import com.example.cdr.eventsmanagementsystem.Events.VenueBooked;
import com.example.cdr.eventsmanagementsystem.Events.VenueCancelled;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class EmailNotifications implements NotificationService{
    private final JavaMailSender mailSender;

    @EventListener
    public void onBooked(VenueBooked event) {
        sendNotification(event.venue(), "Venue Booked","Your Venue has been booked");
    }
    @EventListener
    public void onCancelled(VenueCancelled event) {
        sendNotification(event.venue(), "Venue Cancelled","Your Venue booking has been cancelled");
    }

    @Override
    public void sendNotification(Venue venue,String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(venue.getVenueProvider().getEmail());
        message.setSubject(subject);
        message.setText("Hello,\n\n" + body + "\n\nVenue: " + venue.getName());
        mailSender.send(message);
    }
}

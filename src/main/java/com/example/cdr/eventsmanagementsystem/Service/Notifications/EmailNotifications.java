package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.ServiceBooked;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.ServiceCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.VenueBooked;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.VenueCancelled;
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
    public void onVenueBooking(VenueBooked event) {
        sendVenueNotification(event.venue(), "Venue Booked","Your Venue has been booked");
    }
    @EventListener
    public void onVenueCancellation(VenueCancelled event) {
        sendVenueNotification(event.venue(), "Venue Cancelled","Your Venue booking has been cancelled");
    }

    @EventListener
    public void onServiceBooking(ServiceBooked event) {
        sendServiceNotification(event.services(), "Service Booked", "Your service has been booked");
    }

    @EventListener
    public void onServiceCancellation(ServiceCancelled event) {
        sendServiceNotification(event.services(), "Service Cancelled", "Your service booking has been cancelled");
    }


    @Override
    public void sendVenueNotification(Venue venue,String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(venue.getVenueProvider().getEmail());
        message.setSubject(subject);
        message.setText("Hello,\n\n" + body + "\n\nVenue: " + venue.getName());
        mailSender.send(message);
    }
    @Override
    public void sendServiceNotification(Services service, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(service.getServiceProvider().getEmail());
        message.setSubject(subject);
        message.setText("Hello,\n\n" + body + "\n\nService: " + service.getName());
        mailSender.send(message);
    }
}

package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import org.springframework.stereotype.Service;

@Service
public interface NotificationService {
    void sendVenueNotification(Venue venue, String subject, String body);
    void sendServiceNotification(Services service, String subject, String body);
}

package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import org.springframework.stereotype.Service;

@Service
public interface NotificationService {
    void sendNotification(Venue venue, String subject, String body);
}

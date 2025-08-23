package com.example.cdr.eventsmanagementsystem.Service.Notifications;

public interface NotificationChannel {
    void send(String to, String subject, String content);
}

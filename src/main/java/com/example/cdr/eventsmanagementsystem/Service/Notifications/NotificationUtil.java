package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserRoleHandler;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationUtil {
    private final UserSyncService userSyncService;
    private final JavaMailSender mailSender;

    public BaseRoleEntity getProvider(Booking booking, BookingType bookingType) {
        return switch (bookingType) {
            case VENUE -> Objects.nonNull(booking.getVenue()) ? booking.getVenue().getVenueProvider() : null;
            case SERVICE -> Objects.nonNull(booking.getService()) ? booking.getService().getServiceProvider() : null;
            default -> null;
        };
    }
    public String getResourceName(Booking booking, BookingType bookingType) {
        return switch (bookingType) {
            case VENUE -> Objects.nonNull(booking.getVenue()) ? booking.getVenue().getName() : "Unknown Venue";
            case SERVICE -> Objects.nonNull(booking.getService()) ? booking.getService().getName() : "Unknown Service";
            default -> "Unknown Resource";
        };
    }
    public BaseRoleEntity getUser(String userId, String context, Long bookingId) {
        for (UserRoleHandler<?> handler : userSyncService.getHandlers()) {
            BaseRoleEntity user = handler.findUserById(userId);
            if (Objects.nonNull(user)) {
                return user;
            }
        }
        return null;
    }
    public void send(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
    }
}

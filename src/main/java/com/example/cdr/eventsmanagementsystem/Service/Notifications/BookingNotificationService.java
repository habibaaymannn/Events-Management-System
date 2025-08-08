package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingNotificationService {
    
    private final JavaMailSender mailSender;
    private final UserSyncService userSyncService;

    public void sendPaymentRequestEmail(Booking booking, String clientSecret) {
        BaseRoleEntity booker = userSyncService.findExistingUser(booking.getBookerId(), booking.getBookerType().toString());

        if (booker == null) {
            log.error("User not found for payment email: booking {}", booking.getId());
            return;
        }

        String paymentUrl = String.format("http://localhost:8080/payment-page?booking_id=%d&client_secret=%s", 
                                         booking.getId(), clientSecret);
        
        String content = String.format(
            "Hello %s,\n\n" +
            "Complete your payment for booking #%d:\n" +
            "%s\n\n" +
            "Payment expires in 24 hours.\n\n" +
            "Best regards,\nEvents Team",
            booker.getFirstName(), booking.getId(), paymentUrl
        );

        sendEmail(booker.getEmail(), "Complete Payment - Booking #" + booking.getId(), content);
    }

    public void sendBookingConfirmationEmail(Booking booking) {
        BaseRoleEntity booker = userSyncService.findExistingUser(booking.getBookerId(), booking.getBookerType().toString());
        if (booker == null) {
            log.error("User not found for confirmation email: booking {}", booking.getId());
            return;
        }

        String content = String.format(
            "Hello %s,\n\n" +
            "Your booking #%d is confirmed!\n" +
            "Payment ID: %s\n\n" +
            "Best regards,\nEvents Team",
            booker.getFirstName(), booking.getId(), booking.getStripePaymentId()
        );

        sendEmail(booker.getEmail(), "Booking Confirmed #" + booking.getId(), content);
    }

    public void sendBookingCancellationEmail(Booking booking) {
        BaseRoleEntity booker = userSyncService.findExistingUser(booking.getBookerId(), booking.getBookerType().toString());
        if (booker == null) {
            log.error("User not found for confirmation email: booking {}", booking.getId());
            return;
        }

        String content = String.format(
            "Hello %s,\n\n" +
            "Your booking #%d has been cancelled.\n" +
            "Refund will be processed within 5-10 business days.\n\n" +
            "Best regards,\nEvents Team",
            booker.getFirstName(), booking.getId()
        );

        sendEmail(booker.getEmail(), "Booking Cancelled #" + booking.getId(), content);
    }

    public void sendPaymentFailureEmail(Booking booking, String failureReason) {
        BaseRoleEntity booker = userSyncService.findExistingUser(booking.getBookerId(), booking.getBookerType().toString());
        if (booker == null) {
            return;
        }

        String content = String.format(
            "Hello %s,\n\n" +
            "Unfortunately, your payment for booking #%d could not be processed.\n\n" +
            "Reason: %s\n\n" +
            "Please try again or contact support if the issue persists.\n" +
            "Your booking will remain pending for 24 hours.\n\n" +
            "Best regards,\nEvents Team",
            booker.getFirstName(), booking.getId(), failureReason
        );

        sendEmail(booker.getEmail(), "Payment Failed - Booking #" + booking.getId(), content);
    }

    private void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        
        mailSender.send(message);
    }
}

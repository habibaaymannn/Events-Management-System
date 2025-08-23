package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailMessages;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.Helper.NotificationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentNotificationService {
    private final NotificationChannel emailNotification;
    private final NotificationHelper notificationHelper;

    private final String PaymentPageUrl = "http://localhost:8080/payment-page?booking_id=%d&client_secret=%s";

    public void sendPaymentRequestEmail(Booking booking, String clientSecret) {
        try {
            BaseRoleEntity booker = notificationHelper.getUser(booking.getBookerId(), "payment email", booking.getId());
            if (booker == null) return;

            String paymentUrl = String.format(PaymentPageUrl, booking.getId(), clientSecret);
            String content = String.format(EmailMessages.PAYMENT_REQUEST,
                    booker.getFirstName(), booking.getId(), paymentUrl);

            emailNotification.send(booker.getEmail(), "Complete Payment - Booking #" + booking.getId(), content);
        } catch (Exception e) {
            log.error("Failed to send payment request email for booking {}", booking.getId(), e);
        }
    }
    public void sendPaymentFailureEmail(Booking booking, String failureReason) {
        BaseRoleEntity booker = notificationHelper.getUser(booking.getBookerId(), "payment failure", booking.getId());
        if (Objects.isNull(booker)) return;

        String content = String.format(EmailMessages.PAYMENT_FAILED,
                booker.getFirstName(), booking.getId(), failureReason);

        emailNotification.send(booker.getEmail(),String.format( "Payment Failed - Booking #" + booking.getId()), content);
    }
}

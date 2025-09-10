package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants.EmailConstants;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentNotificationService {
    private final NotificationUtil notificationUtil;
    private final AuthUtil authUtil;

    private final String PaymentPageUrl = "http://localhost:8180/payment-page?booking_id=%d&client_secret=%s";

    public void sendPaymentRequestEmail(Booking booking, String clientSecret) {
        try {
            BaseRoleEntity booker = authUtil.getUser(booking.getCreatedBy());
            if (Objects.isNull(booker)) return;

            String paymentUrl = String.format(PaymentPageUrl, booking.getId(), clientSecret);
            String content = String.format(EmailConstants.PAYMENT_REQUEST, booker.getFirstName(), booking.getId(), paymentUrl);

            notificationUtil.send(booker.getEmail(), "Complete Payment - Booking #" + booking.getId(), content);
        } catch (Exception e) {
            log.error("Failed to send payment request email for booking {}", booking.getId(), e);
        }
    }
    public void sendPaymentFailureEmail(Booking booking, String failureReason) {
        BaseRoleEntity booker = authUtil.getUser(booking.getCreatedBy());
        if (Objects.isNull(booker)) return;

        String content = String.format(EmailConstants.PAYMENT_FAILED, booker.getFirstName(), booking.getId(), failureReason);

        notificationUtil.send(booker.getEmail(),String.format( "Payment Failed - Booking #" + booking.getId()), content);
    }
}

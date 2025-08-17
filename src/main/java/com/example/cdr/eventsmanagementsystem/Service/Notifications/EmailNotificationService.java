package com.example.cdr.eventsmanagementsystem.Service.Notifications;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService implements NotificationService {
    
    private final JavaMailSender mailSender;
    private final UserSyncService userSyncService;

    @Override
    public void sendPaymentRequestEmail(Booking booking, String clientSecret) {
        try {
            BaseRoleEntity booker = userSyncService.findUserById(booking.getBookerId());

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
        } catch (Exception e) {
            log.error("Failed to send payment request email for booking {}", booking.getId(), e);
        }
    }

    @Override
    public void sendEventBookingConfirmationEmail(Booking booking) {
        BaseRoleEntity booker = userSyncService.findUserById(booking.getBookerId());
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
    @Override
    public void sendVenueBookingConfirmationEmail(Booking booking) {
        VenueProvider venueProvider = booking.getVenue().getVenueProvider();
        BaseRoleEntity booker = userSyncService.findUserById(booking.getBookerId());
        if (booker == null) {
            log.error("User not found for confirmation email: booking {}", booking.getId());
            return;
        }

        String content = String.format(
                "Hello %s,\n\n" +
                        "Your Venue booking #%d is confirmed!\n" +
                        "Payment ID: %s\n\n" +
                        "Best regards,\nEvents Team",
                booker.getFirstName(), booking.getId(), booking.getStripePaymentId()
        );

        sendEmail(venueProvider.getEmail(), "Booking Confirmed #" + booking.getId(), content);
    }
    @Override
    public void sendServiceBookingConfirmationEmail(Booking booking) {
        ServiceProvider serviceProvider = booking.getService().getServiceProvider();
        BaseRoleEntity booker = userSyncService.findUserById(booking.getBookerId());
        if (booker == null) {
            log.error("User not found for confirmation email: booking {}", booking.getId());
            return;
        }

        String content = String.format(
                "Hello %s,\n\n" +
                        "Your Service booking #%d is confirmed!\n" +
                        "Payment ID: %s\n\n" +
                        "Best regards,\nEvents Team",
                booker.getFirstName(), booking.getId(), booking.getStripePaymentId()
        );

        sendEmail(serviceProvider.getEmail(), "Booking Confirmed #" + booking.getId(), content);
    }

    @Override
    public void sendBookingCancellationEmail(Booking booking) {
        BaseRoleEntity booker = userSyncService.findUserById(booking.getBookerId());
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

    @Override
    public void sendPaymentFailureEmail(Booking booking, String failureReason) {
        BaseRoleEntity booker = userSyncService.findUserById(booking.getBookerId());
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
    @Override
    public void sendVenueBookingEmail(Booking booking) {
        BaseRoleEntity booker = userSyncService.findUserById(booking.getBookerId());
        VenueProvider venueProvider = booking.getVenue().getVenueProvider();
        String content = String.format(
                "Hello %s,\n\n" +
                        "You have a new booking request for your venue '%s'.\n" +
                        "Booking ID: %d\n" +
                        "Date: %s to %s\n" +
                        "Booked by: %s\n\n" +
                        "The booking will be confirmed once payment is completed.\n\n" +
                        "Best regards,\nEvents Team",
                venueProvider.getFirstName(),
                booking.getVenue().getName(),
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booker.getFirstName()
        );
        sendEmail(venueProvider.getEmail(), "New Booking Request for Your Venue", content);
    }
    @Override
    public void sendVenueCancellationEmail(Booking booking,String reason) {
        BaseRoleEntity booker = userSyncService.findExistingUser(booking.getBookerId(), booking.getBookerType().toString());
        VenueProvider venueProvider = booking.getVenue().getVenueProvider();
        String content = String.format(
                "Hello %s,\n\n" +
                        "A booking for your venue '%s' has been cancelled.\n" +
                        "Booking ID: %d\n" +
                        "Original Date: %s to %s\n" +
                        "Booked by: %s (%s)\n" +
                        "Cancellation Reason: %s\n\n" +
                        "Best regards,\nEvents Team",
                venueProvider.getFirstName(),
                booking.getVenue().getName(),
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booker.getFullName(),
                booker.getEmail(),
                reason
        );
        sendEmail(venueProvider.getEmail(),  "Booking Cancelled for Your Venue: ",content);
    }
    @Override
    public void sendServiceBookingEmail(Booking booking) {
        BaseRoleEntity booker = userSyncService.findExistingUser(booking.getBookerId(), booking.getBookerType().toString());
        ServiceProvider serviceProvider = booking.getService().getServiceProvider();
        String content = String.format(
                "Hello %s,\n\n" +
                        "You have a new booking request for your service '%s'.\n" +
                        "Booking ID: %d\n" +
                        "Date: %s to %s\n" +
                        "Booked by: %s\n\n" +
                        "The booking will be confirmed once payment is completed.\n\n" +
                        "Best regards,\nEvents Team",
                serviceProvider.getFirstName(),
                booking.getService().getName(),
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booker.getFirstName()
        );
        sendEmail(serviceProvider.getEmail(), "New Booking Request for Your Service", content);
    }
    @Override
    public void sendServiceCancellationEmail(Booking booking,String reason) {
        BaseRoleEntity booker = userSyncService.findExistingUser(booking.getBookerId(), booking.getBookerType().toString());
        ServiceProvider serviceProvider = booking.getService().getServiceProvider();
        String content = String.format(
                "Hello %s,\n\n" +
                        "A booking for your service '%s' has been cancelled.\n" +
                        "Booking ID: %d\n" +
                        "Original Date: %s to %s\n" +
                        "Booked by: %s (%s)\n" +
                        "Cancellation Reason: %s\n\n" +
                        "Best regards,\nEvents Team",
                serviceProvider.getFirstName(),
                booking.getService().getName(),
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booker.getFullName(),
                booker.getEmail(),
                reason
        );
        sendEmail(serviceProvider.getEmail(),  "Booking Cancelled for Your Service: ",content);
    }
    @Override
    public void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        
        mailSender.send(message);
    }
}

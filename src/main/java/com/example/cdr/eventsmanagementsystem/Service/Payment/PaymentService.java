package com.example.cdr.eventsmanagementsystem.Service.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.CheckoutSessionResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.BookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.EventBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.ServiceBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.VenueBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Service.Booking.StripeServiceInterface;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService implements PaymentServiceInterface {

    private final BookingRepository bookingRepository;
    private final StripeServiceInterface stripeService;
    private final BookingMapper bookingMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final UserSyncService userSyncService;

    @Value("${app.payment.success-url:http://localhost:8180/v1/payments/confirm}")
    private String paymentSuccessUrl;
    @Value("${app.payment.cancel-url:http://localhost:8180}")
    private String paymentCancelUrl;

    @Override
    @Transactional
    public BookingDetailsResponse captureBookingPayment(Long bookingId, BigDecimal amountToCapture) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        PaymentIntent captured = stripeService.capturePayment(booking.getStripePaymentId(), amountToCapture);
        if ("succeeded".equals(captured.getStatus())) {
            booking.setStatus(BookingStatus.BOOKED);
            booking.setUpdatedAt(LocalDateTime.now());
            Booking savedBooking = bookingRepository.save(booking);
            if (booking.getVenue() != null) {
                eventPublisher.publishEvent(new VenueBookingConfirmed(savedBooking));
            } else if (booking.getService() != null) {
                eventPublisher.publishEvent(new ServiceBookingConfirmed(savedBooking));
            } else {
                eventPublisher.publishEvent(new EventBookingConfirmed(savedBooking));
            }
            return bookingMapper.toBookingDetailsResponse(savedBooking);
        }
        throw new RuntimeException("Capture failed with status: " + captured.getStatus());
    }

    @Override
    @Transactional
    public BookingDetailsResponse voidBookingPayment(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.AUTHORIZED) {
            throw new RuntimeException("Can only void authorized payments. Current status: " + booking.getStatus());
        }

        stripeService.voidPayment(booking.getStripePaymentId());
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        if (booking.getVenue() != null) {
            eventPublisher.publishEvent(new VenueBookingCancelled(savedBooking, reason));
        } else if (booking.getService() != null) {
            eventPublisher.publishEvent(new ServiceBookingCancelled(savedBooking, reason));
        } else if (booking.getEvent() != null) {
            eventPublisher.publishEvent(new EventBookingCancelled(savedBooking, reason));
        }
        return bookingMapper.toBookingDetailsResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingDetailsResponse refundBookingPayment(Long bookingId, BigDecimal amount, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new RuntimeException("Can only refund booked payments. Current status: " + booking.getStatus());
        }

        stripeService.createRefund(booking.getStripePaymentId(), amount, reason);
        booking.setRefundProcessedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        if (amount == null) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancellationReason("Refunded: " + reason);
            booking.setCancelledAt(LocalDateTime.now());
        }
        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toBookingDetailsResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingDetailsResponse confirmCheckoutSession(String sessionId) {
        Booking booking = bookingRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        Session session = stripeService.retrieveCheckoutSession(sessionId);
        String paymentIntentId = session.getPaymentIntent();
        if (paymentIntentId != null) {
            PaymentIntent pi = stripeService.retrievePaymentIntent(paymentIntentId);
            booking.setStripePaymentId(paymentIntentId);
            if ("succeeded".equals(pi.getStatus())) {
                booking.setStatus(BookingStatus.BOOKED);
            } else if ("requires_capture".equals(pi.getStatus())) {
                booking.setStatus(BookingStatus.AUTHORIZED);
            }
            booking.setUpdatedAt(LocalDateTime.now());
            Booking saved = bookingRepository.save(booking);
            return bookingMapper.toBookingDetailsResponse(saved);
        }
        return bookingMapper.toBookingDetailsResponse(booking);
    }

    @Override
    @Transactional
    public CheckoutSessionResponse createSetupCheckoutSessionForCurrentUser() {
        BaseRoleEntity user = userSyncService.ensureUserExists(BaseRoleEntity.class);
        Session session = stripeService.createSetupCheckoutSessionForUser(user, paymentSuccessUrl, paymentCancelUrl);
        CheckoutSessionResponse response = new CheckoutSessionResponse();
        response.setSessionId(session.getId());
        response.setUrl(session.getUrl());
        return response;
    }

    @Override
    @Transactional
    public void setDefaultPaymentMethodForCurrentUser(String paymentMethodId) {
        BaseRoleEntity user = userSyncService.ensureUserExists(BaseRoleEntity.class);
        user.setDefaultPaymentMethodId(paymentMethodId);
        userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()))
                .saveUser(user);
    }
}



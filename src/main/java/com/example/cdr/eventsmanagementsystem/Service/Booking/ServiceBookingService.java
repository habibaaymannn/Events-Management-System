package com.example.cdr.eventsmanagementsystem.Service.Booking;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.ServiceBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.ServiceBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.ServiceBookingCreated;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.Payment.BookingPaymentFailed;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceBookingService {
    @Value("${app.paym ent.page-url:http://localhost:8080/payment-page}")
    private String paymentPageUrl;

    private final ServiceBookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserSyncService userSyncService;
    private final StripeService stripeService;
    private final ServiceBookingMapper bookingMapper;
    private final ApplicationEventPublisher eventPublisher;

    // TODO: Get All Service Bookings
    // TODO: Get All Service Bookings By OrganizerId
    // TODO: Get All Service Bookings By ProviderId

    public ServiceBookingResponse getBookingById(Long bookingId) {
        ServiceBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        return bookingMapper.toServiceBookingResponse(booking);
    }

    @Transactional
    public ServiceBookingResponse createBooking(ServiceBookingRequest request) {
        Services service = serviceRepository.findById(request.getServiceId()).orElseThrow(() -> new EntityNotFoundException("Service not found"));

        Organizer organizer = userSyncService.ensureUserExists(Organizer.class);

        Customer customer = stripeService.createCustomer(
                organizer.getEmail(),
                organizer.getFullName(),
                null
        );

        BigDecimal amount = BigDecimal.valueOf(service.getPrice());

        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                amount,
                request.getCurrency() != null ? request.getCurrency() : "usd",
                customer.getId(),
                "Service booking for: " + service.getName()
        );

        ServiceBooking booking = bookingMapper.toServiceBooking(request);
        // TODO: Think about this with mahmoud
        // booking.setStripePaymentId(paymentIntent.getId());

        bookingRepository.save(booking);
        eventPublisher.publishEvent(new ServiceBookingCreated(booking));

        ServiceBookingResponse response = bookingMapper.toServiceBookingResponse(booking);
        // TODO: Think about this with mahmoud
        // response.setPaymentUrl(buildPaymentUrl(booking.getId(), paymentIntent.getClientSecret()));
        return response;
    }

    @Transactional
    public ServiceBookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        ServiceBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);

        if (oldStatus == BookingStatus.PENDING && status == BookingStatus.BOOKED) {
            eventPublisher.publishEvent(new ServiceBookingConfirmed(booking));
        }

        bookingRepository.save(booking);
        return bookingMapper.toServiceBookingResponse(booking);
    }

    @Transactional
    public void cancelBooking(BookingCancelRequest request) {
        ServiceBooking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        String currentUserId = AuthUtil.getCurrentUserId();
        if (!booking.getCreatedBy().equals(currentUserId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        // TODO: Isn't just one check of them enough?
        if (booking.getStripePaymentId() != null && booking.getStatus() == BookingStatus.BOOKED) {
            stripeService.createRefund(booking.getStripePaymentId(), null, "Customer requested cancellation");
            booking.setRefundProcessedAt(LocalDateTime.now());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(request.getReason());
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy(currentUserId);

        bookingRepository.save(booking);
        eventPublisher.publishEvent(new ServiceBookingCancelled(booking, request.getReason()));
    }

    @Transactional
    public ServiceBookingResponse completePayment(Long bookingId, String paymentMethodId) {
        ServiceBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Booking is not in PENDING status");
        }

        try {
            PaymentIntent confirmedPayment = stripeService.confirmPaymentIntent(
                    booking.getStripePaymentId(),
                    paymentMethodId
            );

            if ("succeeded".equals(confirmedPayment.getStatus())) {
                booking.setStatus(BookingStatus.BOOKED);
                bookingRepository.save(booking);
                eventPublisher.publishEvent(new ServiceBookingConfirmed(booking));
                return bookingMapper.toServiceBookingResponse(booking);
            } else {
                eventPublisher.publishEvent(new BookingPaymentFailed(booking,"Payment was not successful. Status: " + confirmedPayment.getStatus()));
                throw new RuntimeException("Payment was not successful. Status: " + confirmedPayment.getStatus());
            }
        } catch (Exception e) {
            eventPublisher.publishEvent(new BookingPaymentFailed(booking,"Payment failed: " + e.getMessage()));
            throw new RuntimeException("Payment failed: " + e.getMessage(), e);
        }
    }

    private String buildPaymentUrl(Long bookingId, String clientSecret) {
        return String.format("%s?booking_id=%d&client_secret=%s", paymentPageUrl,
                bookingId, clientSecret);
    }
}

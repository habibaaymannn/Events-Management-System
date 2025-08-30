package com.example.cdr.eventsmanagementsystem.Service.Booking;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.EventBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.EventBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.EventBookingCreated;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.Payment.BookingPaymentFailed;
import com.example.cdr.eventsmanagementsystem.Repository.EventBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
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

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventBookingService {
    @Value("${app.paym ent.page-url:http://localhost:8080/payment-page}")
    private String paymentPageUrl;

    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserSyncService userSyncService;
    private final StripeService stripeService;
    private final EventBookingMapper bookingMapper;
    private final ApplicationEventPublisher eventPublisher;

    // TODO: Get All Event Bookings
    // TODO: Get All Event Bookings By EventId
    // TODO: Get All Event Bookings By AttendeeId

    public EventBookingResponse getBookingById(Long bookingId) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        return bookingMapper.toEventBookingResponse(booking);
    }

    @Transactional
    public EventBookingResponse createBooking(EventBookingRequest request) {
        Event event = eventRepository.findById(request.getEventId()).orElseThrow(() -> new EntityNotFoundException("Event not found"));

        Attendee attendee = userSyncService.ensureUserExists(Attendee.class);

        Customer customer = stripeService.createCustomer(
                attendee.getEmail(),
                attendee.getFullName(),
                null
        );

        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                event.getRetailPrice(),
                request.getCurrency() != null ? request.getCurrency() : "usd",
                customer.getId(),
                "Event booking for: " + event.getName()
        );

        EventBooking booking = bookingMapper.toEventBooking(request);
        // TODO: Think about this with mahmoud
        // booking.setStripePaymentId(paymentIntent.getId());

        bookingRepository.save(booking);
        eventPublisher.publishEvent(new EventBookingCreated(booking));

        EventBookingResponse response = bookingMapper.toEventBookingResponse(booking);
        // TODO: Think about this with mahmoud
        // response.setPaymentUrl(buildPaymentUrl(booking.getId(), paymentIntent.getClientSecret()));
        return response;
    }

    @Transactional
    public EventBookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);

        if (oldStatus == BookingStatus.PENDING && status == BookingStatus.BOOKED) {
            eventPublisher.publishEvent(new EventBookingConfirmed(booking));
        }

        bookingRepository.save(booking);
        return bookingMapper.toEventBookingResponse(booking);
    }

    @Transactional
    public void cancelBooking(BookingCancelRequest request) {
        EventBooking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

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
        eventPublisher.publishEvent(new EventBookingCancelled(booking, request.getReason()));
    }

    @Transactional
    public EventBookingResponse completePayment(Long bookingId, String paymentMethodId) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

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
                eventPublisher.publishEvent(new EventBookingConfirmed(booking));
                return bookingMapper.toEventBookingResponse(booking);
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

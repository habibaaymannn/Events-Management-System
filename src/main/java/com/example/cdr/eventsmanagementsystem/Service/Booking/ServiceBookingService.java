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
import com.example.cdr.eventsmanagementsystem.Repository.ServiceBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.stripe.model.Customer;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.SETUP_FUTURE_USAGE_ON_SESSION;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceBookingService {
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
        if (organizer.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(organizer.getEmail(), organizer.getFullName(), null);
            organizer.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(organizer);
        }

        ServiceBooking booking = bookingMapper.toServiceBooking(request);
        var session = stripeService.createCheckoutSession(
                organizer.getStripeCustomerId(),
                BigDecimal.valueOf(service.getPrice()),
                request.getCurrency(),
                "Service booking for: " + service.getName(),
                booking.getId(),
                SETUP_FUTURE_USAGE_ON_SESSION,
                request.getIsCaptured() != null ? request.getIsCaptured() : false
        );
        booking.setStripeSessionId(session.getId());

        bookingRepository.save(booking);
        eventPublisher.publishEvent(new ServiceBookingCreated(booking));

        ServiceBookingResponse response = bookingMapper.toServiceBookingResponse(booking);
        response.setPaymentUrl(session.getUrl());
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
}

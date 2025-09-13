package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;

import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingUpdates.ServiceBookingUpdate;
import com.example.cdr.eventsmanagementsystem.Service.Payment.StripeService;
import com.example.cdr.eventsmanagementsystem.Util.BookingUtil;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.ADMIN_ROLE;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.BOOKING_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.SERVICE_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.SETUP_FUTURE_USAGE_ON_SESSION;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.ServiceBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
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
    private final BookingUtil bookingUtil;

    public Page<ServiceBookingResponse> getAllServiceBookings(Pageable pageable) {
        Page<ServiceBooking> bookings = bookingRepository.findAll(pageable);
        return bookings.map(bookingMapper::toServiceBookingResponse);
    }

    public Page<ServiceBookingResponse> getAllServiceBookingsByOrganizerId(String organizerId, Pageable pageable) {
        Page<ServiceBooking> bookings = bookingRepository.findByCreatedBy(organizerId, pageable);
        return bookings.map(bookingMapper::toServiceBookingResponse);
    }

    public Page<ServiceBookingResponse> getAllServiceBookingsByServiceProviderId(String providerId, Pageable pageable) {
        Page<ServiceBooking> bookings = bookingRepository.findByServiceProviderId(providerId, pageable);
        return bookings.map(bookingMapper::toServiceBookingResponse);
    }

    public Page<ServiceBookingResponse> getAllServiceBookingsByEventId(Long eventId, Pageable pageable) {
        Page<ServiceBooking> bookings = bookingRepository.findByEventId(eventId, pageable);
        return bookings.map(bookingMapper::toServiceBookingResponse);
    }

    public ServiceBookingResponse getBookingById(Long bookingId) {
        ServiceBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String providerId = serviceRepository.findById(booking.getServiceId()).map(Services::getServiceProvider).map(ServiceProvider::getId).orElse(null);
        boolean isOrganizer = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isProvider = currentUserId != null && currentUserId.equals(providerId);
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isOrganizer || isProvider || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS);
        }
        return bookingMapper.toServiceBookingResponse(booking);
    }

    @Transactional
    public ServiceBookingResponse createBooking(ServiceBookingRequest request) {
        Organizer organizer = userSyncService.ensureUserExists(Organizer.class);
        if (organizer.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(organizer.getEmail(), organizer.getFullName(), null);
            organizer.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(organizer);
        }
        ServiceBooking booking = bookingMapper.toServiceBooking(request);
        booking.setStatus(BookingStatus.PENDING);
        bookingRepository.save(booking);
        eventPublisher.publishEvent(new ServiceBookingCreated(booking));
        return bookingMapper.toServiceBookingResponse(booking);
    }

    @Transactional
    public ServiceBookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        ServiceBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));
        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String providerId = serviceRepository.findById(booking.getServiceId()).map(Services::getServiceProvider).map(ServiceProvider::getId).orElse(null);
        boolean isOrganizer = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isProvider = currentUserId != null && currentUserId.equals(providerId);
        boolean isAdmin = ADMIN_ROLE.equals(userRole);

        if (!(isOrganizer || isProvider || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS);
        }
        BookingStatus oldStatus = booking.getStatus();
        if (oldStatus == BookingStatus.PENDING && status == BookingStatus.ACCEPTED) {
            booking.setStatus(BookingStatus.ACCEPTED);
            bookingRepository.save(booking);
            eventPublisher.publishEvent(new ServiceBookingUpdate(booking)); // Notify organizer
            return bookingMapper.toServiceBookingResponse(booking);
            // NO Stripe session created here! Only when organizer clicks "Pay Now"
        }
        // Provider REJECTS → change to REJECTED (no payment allowed)
        if (oldStatus == BookingStatus.PENDING && status == BookingStatus.REJECTED) {
            booking.setStatus(BookingStatus.REJECTED);
            bookingRepository.save(booking);
            eventPublisher.publishEvent(new ServiceBookingUpdate(booking)); // Notify organizer
            return bookingMapper.toServiceBookingResponse(booking);
        }
        // Stripe webhook will move ACCEPTED → BOOKED once paid
        if (oldStatus == BookingStatus.ACCEPTED && status == BookingStatus.BOOKED) {
            booking.setStatus(BookingStatus.BOOKED);
            bookingRepository.save(booking);
            eventPublisher.publishEvent(new ServiceBookingConfirmed(booking));
            return bookingMapper.toServiceBookingResponse(booking);
        }
        throw new IllegalStateException("Invalid booking status transition: " + oldStatus + " → " + status);
    }
    @Transactional
    public String createPaymentSession(Long bookingId) {
        ServiceBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));
        // Only allow payment for ACCEPTED bookings
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot create payment session for booking status: " + booking.getStatus());
        }
        Services service = serviceRepository.findById(booking.getServiceId()).orElseThrow(() -> new EntityNotFoundException(SERVICE_NOT_FOUND));
        Organizer organizer = userSyncService.getUserById(booking.getCreatedBy(), Organizer.class);

        if (Objects.isNull(organizer.getStripeCustomerId())) {
            Customer createdCustomer = stripeService.createCustomer(organizer.getEmail(), organizer.getFullName(), null);
            organizer.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(organizer);
        }
        var session = stripeService.createCheckoutSession(
                organizer.getStripeCustomerId(),
                BigDecimal.valueOf(service.getPrice()),
                booking.getCurrency(),
                "Service booking for: " + service.getName(),
                booking.getId(),
                SETUP_FUTURE_USAGE_ON_SESSION,
                false,
                BookingType.SERVICE
        );
        booking.setStripeSessionId(session.getId());
        bookingRepository.save(booking);
        return session.getUrl(); // Return just the payment URL
    }

    @Transactional
    public void cancelBooking(BookingCancelRequest request) {
        ServiceBooking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String providerId = serviceRepository.findById(booking.getServiceId()).map(Services::getServiceProvider).map(ServiceProvider::getId).orElse(null);
        boolean isOrganizer = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isProvider = currentUserId != null && currentUserId.equals(providerId);
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isOrganizer || isProvider || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS);
        }

        if (booking.getStripePaymentId() != null && booking.getStatus() == BookingStatus.BOOKED) {
            String stripeReason = bookingUtil.mapToStripeRefundReason(request.getReason());
            stripeService.createRefund(booking.getStripePaymentId(), null, stripeReason);
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

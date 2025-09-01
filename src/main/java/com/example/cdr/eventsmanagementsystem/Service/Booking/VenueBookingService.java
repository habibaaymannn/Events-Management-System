package com.example.cdr.eventsmanagementsystem.Service.Booking;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.VenueBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.VenueBookingCreated;
import com.example.cdr.eventsmanagementsystem.Repository.VenueBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.stripe.model.Customer;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.ADMIN_ROLE;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.SETUP_FUTURE_USAGE_ON_SESSION;

@Slf4j
@Service
@RequiredArgsConstructor
public class VenueBookingService {
    private final VenueBookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final UserSyncService userSyncService;
    private final StripeService stripeService;
    private final VenueBookingMapper bookingMapper;
    private final ApplicationEventPublisher eventPublisher;

    // TODO: Get All Venue Bookings
    // TODO: Get All Venue Bookings By OrganizerId
    // TODO: Get All Venue Bookings By ProviderId

    public VenueBookingResponse getBookingById(Long bookingId) {
        VenueBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        // TODO: Check authorization
        return bookingMapper.toVenueBookingResponse(booking);
    }

    @Transactional
    public VenueBookingResponse createBooking(VenueBookingRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId()).orElseThrow(() -> new EntityNotFoundException("Venue not found"));

        Organizer organizer = userSyncService.ensureUserExists(Organizer.class);
        if (organizer.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(organizer.getEmail(), organizer.getFullName(), null);
            organizer.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(organizer);
        }

        BigDecimal amount = BigDecimal.valueOf(venue.getPricing().getPerEvent());
        VenueBooking booking = bookingMapper.toVenueBooking(request);
        var session = stripeService.createCheckoutSession(
                organizer.getStripeCustomerId(),
                amount,
                request.getCurrency(),
                "Venue booking for: " + venue.getName(),
                booking.getId(),
                SETUP_FUTURE_USAGE_ON_SESSION,
                request.getIsCaptured() != null ? request.getIsCaptured() : false
        );
        booking.setStripeSessionId(session.getId());

        bookingRepository.save(booking);
        eventPublisher.publishEvent(new VenueBookingCreated(booking));

        VenueBookingResponse response = bookingMapper.toVenueBookingResponse(booking);
        response.setPaymentUrl(session.getUrl());
        return response;
    }

    @Transactional
    public VenueBookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        VenueBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String providerId = venueRepository.findById(booking.getVenueId()).map(Venue::getCreatedBy).orElse("Unknown provider");
        if (!providerId.equals(currentUserId) && !ADMIN_ROLE.equals(userRole)) {
            throw new RuntimeException("You can only update your own bookings");
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);

        if (oldStatus == BookingStatus.PENDING && status == BookingStatus.BOOKED) {
            eventPublisher.publishEvent(new VenueBookingConfirmed(booking));
        }

        bookingRepository.save(booking);
        return bookingMapper.toVenueBookingResponse(booking);
    }

    @Transactional
    public void cancelBooking(BookingCancelRequest request) {
        VenueBooking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        // TODO: Check authorization
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
        eventPublisher.publishEvent(new VenueBookingCancelled(booking, request.getReason()));
    }
}

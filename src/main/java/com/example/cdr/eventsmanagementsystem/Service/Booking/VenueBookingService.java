package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.context.ApplicationEventPublisher;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.ADMIN_ROLE;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.BOOKING_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.UNKNOWN_PROVIDER;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.VENUE_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.SETUP_FUTURE_USAGE_ON_SESSION;
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

    public Page<VenueBookingResponse> getAllVenueBookings(Pageable pageable) {
        Page<VenueBooking> bookings = bookingRepository.findAll(pageable);
        return bookings.map(bookingMapper::toVenueBookingResponse);
    }   

    public Page<VenueBookingResponse> getAllVenueBookingsByOrganizerId(String organizerId, Pageable pageable) {
        Page<VenueBooking> bookings = bookingRepository.findByCreatedBy(organizerId, pageable);
        return bookings.map(bookingMapper::toVenueBookingResponse);
    }
    
    public Page<VenueBookingResponse> getAllVenueBookingsByVenueProviderId(String providerId, Pageable pageable) {
        Page<VenueBooking> bookings = bookingRepository.findByVenueProviderId(providerId, pageable);
        return bookings.map(bookingMapper::toVenueBookingResponse);
    }

    public Page<VenueBookingResponse> getAllVenueBookingsByEventId(Long eventId, Pageable pageable) {
        Page<VenueBooking> bookings = bookingRepository.findByEventId(eventId, pageable);
        return bookings.map(bookingMapper::toVenueBookingResponse);
    }

    public VenueBookingResponse getBookingById(Long bookingId) {
        VenueBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));
        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String providerId = venueRepository.findById(booking.getVenueId()).map(Venue::getCreatedBy).orElse(UNKNOWN_PROVIDER);
        boolean isOrganizer = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isProvider = currentUserId != null && currentUserId.equals(providerId);
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isOrganizer || isProvider || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS);
        }
        return bookingMapper.toVenueBookingResponse(booking);
    }

    @Transactional
    public VenueBookingResponse createBooking(VenueBookingRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId()).orElseThrow(() -> new EntityNotFoundException(VENUE_NOT_FOUND));

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
                request.getIsCaptured() != null ? request.getIsCaptured() : false,
                BookingType.VENUE
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
        VenueBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String providerId = venueRepository.findById(booking.getVenueId()).map(Venue::getCreatedBy).orElse(UNKNOWN_PROVIDER);
        boolean isProvider = currentUserId != null && currentUserId.equals(providerId);
        boolean isOrganizer = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isProvider || isOrganizer || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS);
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
        VenueBooking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String providerId = venueRepository.findById(booking.getVenueId()).map(Venue::getCreatedBy).orElse(UNKNOWN_PROVIDER);
        boolean isProvider = currentUserId != null && currentUserId.equals(providerId);
        boolean isOrganizer = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isProvider || isOrganizer || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS);
        }

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

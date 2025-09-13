package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.time.LocalDateTime;

import com.example.cdr.eventsmanagementsystem.Service.Payment.StripeService;
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
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.EVENT_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.SETUP_FUTURE_USAGE_ON_SESSION;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.EventBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.EventBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.EventBookingCreated;
import com.example.cdr.eventsmanagementsystem.Repository.EventBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.stripe.model.Customer;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventBookingService {
    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserSyncService userSyncService;
    private final StripeService stripeService;
    private final EventBookingMapper bookingMapper;
    private final ApplicationEventPublisher eventPublisher;

    public Page<EventBookingResponse> getAllEventBookings(Pageable pageable) {
        Page<EventBooking> bookings = bookingRepository.findAll(pageable);
        return bookings.map(bookingMapper::toEventBookingResponse);
    }

    public Page<EventBookingResponse> getAllEventBookingsByEventId(Long eventId, Pageable pageable) {
        Page<EventBooking> bookings = bookingRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable);
        return bookings.map(bookingMapper::toEventBookingResponse);
    }

    public Page<EventBookingResponse> getAllEventBookingsByAttendeeId(String attendeeId, Pageable pageable) {
        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);

        if (!attendeeId.equals(currentUserId) && !ADMIN_ROLE.equals(userRole)) {
            throw new RuntimeException(YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS);
        }

        Page<EventBooking> bookings = bookingRepository.findByCreatedBy(attendeeId, pageable);
        return bookings.map(bookingMapper::toEventBookingResponse);
    }

    public EventBookingResponse getBookingById(Long bookingId) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);
        String organizerId = eventRepository.findById(booking.getEventId()).map(Event::getOrganizer).map(Organizer::getId).orElse(null);
        boolean isAttendee = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isOrganizer = currentUserId != null && currentUserId.equals(organizerId);
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isAttendee || isOrganizer || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS);
        }
        return bookingMapper.toEventBookingResponse(booking);
    }

    @Transactional
    public EventBookingResponse createBooking(EventBookingRequest request) {
        Event event = eventRepository.findById(request.getEventId()).orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));

        Attendee attendee = userSyncService.ensureUserExists(Attendee.class);
        if (attendee.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(attendee.getEmail(), attendee.getFullName(), null);
            attendee.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(attendee);
        }

        EventBooking booking = bookingMapper.toEventBooking(request);
        var session = stripeService.createCheckoutSession(
                attendee.getStripeCustomerId(),
                event.getRetailPrice(),
                request.getCurrency(),
                "Event ticket for: " + event.getName(),
                booking.getId(),
                SETUP_FUTURE_USAGE_ON_SESSION,
                request.getIsCaptured() != null ? request.getIsCaptured() : false,
                BookingType.EVENT
        );
        booking.setStripeSessionId(session.getId());

        bookingRepository.save(booking);
        eventPublisher.publishEvent(new EventBookingCreated(booking));

        EventBookingResponse response = bookingMapper.toEventBookingResponse(booking);
        response.setPaymentUrl(session.getUrl());
        return response;
    }

    @Transactional
    public EventBookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);

        String organizerId = eventRepository.findById(booking.getEventId()).map(Event::getOrganizer).map(Organizer::getId).orElse(null);
        boolean isAttendee = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isOrganizer = currentUserId != null && currentUserId.equals(organizerId);
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isAttendee || isOrganizer || isAdmin)) {
            throw new RuntimeException(YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS);
        }

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
        EventBooking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userRole = userSyncService.getCurrentUserRole(authentication);

        String organizerId = eventRepository.findById(booking.getEventId()).map(Event::getOrganizer).map(Organizer::getId).orElse(null);
        boolean isAttendee = currentUserId != null && currentUserId.equals(booking.getCreatedBy());
        boolean isOrganizer = currentUserId != null && currentUserId.equals(organizerId);
        boolean isAdmin = ADMIN_ROLE.equals(userRole);
        if (!(isAttendee || isOrganizer || isAdmin)) {
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
        eventPublisher.publishEvent(new EventBookingCancelled(booking, request.getReason()));
    }
}

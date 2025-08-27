package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants.SETUP_FUTURE_USAGE_ON_SESSION;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentExceptionConstants.BOOKING_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentExceptionConstants.EVENT_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentExceptionConstants.SERVICE_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.PaymentExceptionConstants.VENUE_NOT_FOUND;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.BookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.EventBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.ServiceBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation.VenueBookingCancelled;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.ServiceBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.EventBookingCreated;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.ServiceBookingCreated;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation.VenueBookingCreated;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
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
public class BookingService implements BookingServiceInterface {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ServiceRepository serviceRepository;
    private final BookingMapper bookingMapper;
    private final StripeServiceInterface stripeService;
    private final UserSyncService userSyncService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public EventBookingResponse bookEvent(EventBookingRequest request) {

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));

        Attendee attendee = userSyncService.ensureUserExists(Attendee.class);
        if (attendee.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(attendee.getEmail(), attendee.getFullName(), null);
            attendee.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(attendee);
        }

        BigDecimal unitPrice = event.getRetailPrice() != null ? event.getRetailPrice() : new BigDecimal("50.00");
        BigDecimal totalAmount = unitPrice.multiply(new BigDecimal(request.getTicketQuantity()));

        Booking booking = bookingMapper.toBooking(request);
        booking.setEvent(event);
        booking.setAttendeeBooker(attendee);
        booking.setStatus(BookingStatus.PENDING); 
        booking.setAmount(totalAmount);
        booking.setCurrency(request.getCurrency().toString());
        booking.setStartTime(event.getStartTime());
        booking.setEndTime(event.getEndTime());

        Booking savedBooking = bookingRepository.save(booking);

        var session = stripeService.createCheckoutSession(
            attendee.getStripeCustomerId(),
            totalAmount,
            request.getCurrency().toString(),
            "Event ticket for: " + event.getName(),
            savedBooking.getId(),
            SETUP_FUTURE_USAGE_ON_SESSION,
            request.getIsCaptured() != null ? request.getIsCaptured() : false
        );
        savedBooking.setStripeSessionId(session.getId());
        savedBooking = bookingRepository.save(savedBooking);

        eventPublisher.publishEvent(new EventBookingCreated(savedBooking));

        EventBookingResponse response = bookingMapper.toEventBookingResponse(savedBooking);
        response.setPaymentUrl(session.getUrl());
        return response;
    }

    @Override
    @Transactional
    public VenueBookingResponse bookVenue(VenueBookingRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new EntityNotFoundException(VENUE_NOT_FOUND));

        Organizer organizer = userSyncService.ensureUserExists(Organizer.class);
        if (organizer.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(organizer.getEmail(), organizer.getFullName(), null);
            organizer.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(organizer);
        }

        BigDecimal amount = BigDecimal.valueOf(venue.getPricing().getPerEvent());

        Booking booking = bookingMapper.toBooking(request);
        booking.setVenue(venue);
        if (request.getEventId() != null) {
            Event ev = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));
            booking.setEvent(ev);
        }
        booking.setOrganizerBooker(organizer);
        booking.setStatus(BookingStatus.PENDING); 
        booking.setAmount(amount);
        booking.setCurrency(request.getCurrency().toString());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        Booking savedBooking = bookingRepository.save(booking);

        var sessionVenue = stripeService.createCheckoutSession(
            organizer.getStripeCustomerId(),
            amount,
            request.getCurrency().toString(),
            "Venue booking for: " + venue.getName(),
            savedBooking.getId(),
            SETUP_FUTURE_USAGE_ON_SESSION,
            request.getIsCaptured() != null ? request.getIsCaptured() : false
        );
        savedBooking.setStripeSessionId(sessionVenue.getId());
        savedBooking = bookingRepository.save(savedBooking);

        eventPublisher.publishEvent(new VenueBookingCreated(savedBooking));

        VenueBookingResponse response = bookingMapper.toVenueBookingResponse(savedBooking);
        response.setPaymentUrl(sessionVenue.getUrl());
        return response;
    }

    @Override
    @Transactional
    public ServiceBookingResponse bookService(ServiceBookingRequest request) {
        Services service =
                serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new EntityNotFoundException(SERVICE_NOT_FOUND));

        Organizer organizer = userSyncService.ensureUserExists(Organizer.class);
        if (organizer.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(organizer.getEmail(), organizer.getFullName(), null);
            organizer.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(organizer);
        }

        Booking booking = bookingMapper.toBooking(request);
        booking.setService(service);
        if (request.getEventId() != null) {
            Event ev = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));
            booking.setEvent(ev);
        }
        booking.setOrganizerBooker(organizer);
        booking.setStatus(BookingStatus.PENDING); 
        booking.setAmount(BigDecimal.valueOf(service.getPrice()));
        booking.setCurrency(request.getCurrency().toString());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        Booking savedBooking = bookingRepository.save(booking);

        var sessionService = stripeService.createCheckoutSession(
            organizer.getStripeCustomerId(),
            BigDecimal.valueOf(service.getPrice()),
            request.getCurrency().toString(),
            "Service booking for: " + service.getName(),
            savedBooking.getId(),
            SETUP_FUTURE_USAGE_ON_SESSION,
            request.getIsCaptured() != null ? request.getIsCaptured() : false
        );
        savedBooking.setStripeSessionId(sessionService.getId());
        savedBooking = bookingRepository.save(savedBooking);

        eventPublisher.publishEvent(new ServiceBookingCreated(savedBooking));

        ServiceBookingResponse response = bookingMapper.toServiceBookingResponse(savedBooking);
        response.setPaymentUrl(sessionService.getUrl());
        return response;
    }

    @Override
    @Transactional
    public BookingDetailsResponse completePayment(Long bookingId, String paymentMethodId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

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
                Booking savedBooking = bookingRepository.save(booking);

                if(booking.getVenue() != null) {
                    eventPublisher.publishEvent(new VenueBookingConfirmed(savedBooking));
                }else if(booking.getService() != null) {
                    eventPublisher.publishEvent(new ServiceBookingConfirmed(savedBooking));
                }else{
                    eventPublisher.publishEvent(new EventBookingConfirmed(savedBooking));

                }
                
                return bookingMapper.toBookingDetailsResponse(savedBooking);
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

    @Override
    @Transactional
    public void cancelBooking(BookingCancelRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));

        String currentUserId = AuthUtil.getCurrentUserId();

        //case 1
        if (booking.getEvent() != null && booking.getBookerType() == BookerType.ORGANIZER) {
            // Fetch all attendee bookings for this event
            List<Booking> attendeeBookings = bookingRepository.findByEventIdAndBookerType(
                    booking.getEvent().getId(),
                    BookerType.ATTENDEE
            );

            for (Booking attendeeBooking : attendeeBookings) {
                attendeeBooking.setStatus(BookingStatus.CANCELLED);
                attendeeBooking.setCancellationReason(request.getReason());
                attendeeBooking.setCancelledAt(LocalDateTime.now());
                attendeeBooking.setCancelledBy(currentUserId);

                bookingRepository.save(attendeeBooking);
            }
        }
        // case 2
        if (booking.getStripePaymentId() != null && 
            booking.getStatus() == BookingStatus.BOOKED) {
            
            stripeService.createRefund(booking.getStripePaymentId(), null, "Customer requested cancellation");
            booking.setRefundProcessedAt(LocalDateTime.now());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(request.getReason());
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy(currentUserId);  

        Booking savedBooking = bookingRepository.save(booking);

        if (savedBooking.getVenue() != null) {
            eventPublisher.publishEvent(new VenueBookingCancelled(savedBooking, request.getReason()));
        }
        else if (savedBooking.getService() != null) {
            eventPublisher.publishEvent(new ServiceBookingCancelled(savedBooking, request.getReason()));
        }
        else if (savedBooking.getEvent() != null) {
            eventPublisher.publishEvent(new EventBookingCancelled(savedBooking, request.getReason()));
        }
    }

    @Override
    public BookingDetailsResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException(BOOKING_NOT_FOUND));
        
        return bookingMapper.toBookingDetailsResponse(booking);
    }

    @Override
    public List<BookingDetailsResponse> getBookingsByAttendee(String attendeeId) {
        List<Booking> bookings = bookingRepository.findByBookerId(attendeeId);

        return bookings.stream()
                .map(bookingMapper::toBookingDetailsResponse)
                .toList();
    }

    @Override
    public List<BookingDetailsResponse> getBookingsByEvent(Long eventId) {
        List<Booking> bookings = bookingRepository.findByEvent_Id(eventId);

        return bookings.stream()
                .map(bookingMapper::toBookingDetailsResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingDetailsResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);
        
        if (oldStatus == BookingStatus.PENDING && status == BookingStatus.BOOKED) {
            if (booking.getVenue() != null) {
                eventPublisher.publishEvent(new VenueBookingConfirmed(booking));
            } else if (booking.getService() != null) {
                eventPublisher.publishEvent(new ServiceBookingConfirmed(booking));
            } else {
                eventPublisher.publishEvent(new EventBookingConfirmed(booking));
            }
        }

        Booking savedBooking = bookingRepository.save(booking);

        return bookingMapper.toBookingDetailsResponse(savedBooking);
    }
}

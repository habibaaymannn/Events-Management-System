package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.ADMIN_ROLE;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.BOOKING_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.EVENT_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.FirstPaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.FirstPaymentResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.PaymentServiceResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.SubsequentPaymentRequest;
import com.example.cdr.eventsmanagementsystem.Mapper.EventBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.EventBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.Repository.EventBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Service.Payment.StripeService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.example.cdr.eventsmanagementsystem.Util.BookingUtil;
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
    private final BookingUtil bookingUtil;
    private final RestClient restClient;
    
    @Value("${payment.service.url:http://localhost:8082}")
    private String paymentServiceBaseUrl;

    @Value("${payment.service.enabled:true}")
    private boolean paymentServiceEnabled;

    @Value("${payment.service.success-url:http://localhost:8080/api/v1/bookings/success}")
    private String paymentSuccessUrl;
    @Value("${payment.service.cancel-url:http://localhost:8080/api/v1/bookings/cancel}")
    private String paymentCancelUrl;

    @Value("${payment.service.system-id:EVENTS_MANAGEMENT_SYSTEM}")
    private String systemId;

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
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));

        Attendee attendee = userSyncService.ensureUserExists(Attendee.class);
        if (attendee.getStripeCustomerId() == null) {
            Customer createdCustomer = stripeService.createCustomer(attendee.getEmail(), attendee.getFullName(), null);
            attendee.setStripeCustomerId(createdCustomer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(attendee);
        }

        EventBooking booking = bookingMapper.toEventBooking(request);
        booking.setEventId(event.getId());
        booking.setCreatedBy(attendee.getId());

        booking = bookingRepository.save(booking);

        String paymentUrl = null;

        if (paymentServiceEnabled) {
            try {

                Map<String, String> metadata = new HashMap<>();
                metadata.put("bookingType", BookingType.EVENT.name());

                FirstPaymentRequest paymentRequest = new FirstPaymentRequest(
                        request.getAmount(),
                        request.getCurrency(),
                        request.getPaymentProvider(),
                        "Event ticket for: " + event.getName(),
                        1L,
                        attendee.getFullName(),
                        attendee.getEmail(),
                        paymentSuccessUrl, // successUrl
                        paymentCancelUrl, // cancelUrl
                        null,
                        systemId,
                        booking.getId().toString(),
                        metadata
                );

                String paymentEndpoint = "/api/v1/payments/direct";
                log.info("Calling payment service at: {}{}", paymentServiceBaseUrl, paymentEndpoint);
                
                PaymentServiceResponse serviceResponse = restClient.post()
                        .uri(paymentEndpoint)  
                        .body(paymentRequest)
                        .contentType(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .body(PaymentServiceResponse.class);

                if (serviceResponse != null && serviceResponse.data() != null) {
                    FirstPaymentResponse paymentResponse = serviceResponse.data();
                    paymentUrl = paymentResponse.redirectUrl();
                    booking.setStripeSessionId(paymentResponse.referenceId());
                    bookingRepository.save(booking);
                }
            } catch (RestClientException e) {
                log.error("Failed to process payment via external service at {}{}: {}", 
                         paymentServiceBaseUrl, "/api/v1/payments/direct", e.getMessage(), e);
                throw new RestClientException("Payment service is unavailable. Please try again later.", e);
            } catch (Exception e) {
                log.error("Unexpected error during payment processing: {}", e.getMessage(), e);
                throw new RuntimeException("Payment processing failed. Please try again later.", e);
            }
        } else {
            log.warn("Payment service is disabled. Booking created without external payment processing.");
            booking.setStatus(BookingStatus.PENDING);
            bookingRepository.save(booking);
        }

        EventBookingResponse response = bookingMapper.toEventBookingResponse(booking);
        response.setPaymentUrl(paymentUrl);
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
            throw new AccessDeniedException(YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS);
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
            throw new AccessDeniedException(YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS);
        }

        if (booking.getStripeSessionId() != null && booking.getStatus() == BookingStatus.BOOKED) {

            if(paymentServiceEnabled) {
                try {
                    String cancelEndpoint = "/api/v1/payments/cancel";
                    log.info("Calling payment service at: {}{}", paymentServiceBaseUrl, cancelEndpoint);

                    SubsequentPaymentRequest cancelRequest = new SubsequentPaymentRequest(
                            booking.getStripeSessionId(),
                            booking.getAmount().longValue(),
                            booking.getCurrency(),
                            booking.getPaymentProvider()
                    );

                    restClient.post()
                            .uri(cancelEndpoint)  
                            .body(cancelRequest)
                            .contentType(MediaType.APPLICATION_JSON)
                            .retrieve()
                            .body(Void.class);
                } catch (RestClientException e) {
                    log.error("Failed to process cancellation via external service at {}{}: {}", 
                             paymentServiceBaseUrl, "/api/v1/payments/cancel", e.getMessage(), e);
                    throw new RestClientException("Payment service is unavailable. Please try again later.", e);
                } catch (Exception e) {
                    log.error("Unexpected error during cancellation processing: {}", e.getMessage(), e);
                    throw new RuntimeException("Cancellation processing failed. Please try again later.", e);
                }
            } else {
                log.warn("Payment service is disabled. Refund not processed.");
            }
        }
    }
}

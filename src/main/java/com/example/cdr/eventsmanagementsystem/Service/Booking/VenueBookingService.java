package com.example.cdr.eventsmanagementsystem.Service.Booking;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.ADMIN_ROLE;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.BOOKING_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.UNKNOWN_PROVIDER;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.VENUE_NOT_FOUND;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_CANCEL_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_UPDATE_YOUR_OWN_BOOKINGS;
import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.YOU_CAN_ONLY_VIEW_YOUR_OWN_BOOKINGS;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.FirstPaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.FirstPaymentResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.PaymentServiceResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.SubsequentPaymentRequest;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingConfirmation.VenueBookingConfirmed;
import com.example.cdr.eventsmanagementsystem.Repository.VenueBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
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
public class VenueBookingService {
    private final VenueBookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final UserSyncService userSyncService;
    private final StripeService stripeService;
    private final VenueBookingMapper bookingMapper;
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

        VenueBooking booking = bookingMapper.toVenueBooking(request);
        
        bookingRepository.save(booking);

        String paymentUrl = null;

        if (paymentServiceEnabled) {
            try {
                FirstPaymentRequest paymentRequest = new FirstPaymentRequest(
                        request.getAmount(),
                        request.getCurrency(),
                        request.getPaymentProvider(),
                        "Event ticket for: " + venue.getName(),
                        1L,
                        organizer.getFullName(),
                        organizer.getEmail(),
                        paymentSuccessUrl, // successUrl
                        paymentCancelUrl, // cancelUrl
                        null
                        // booking.getId().toString()
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

        VenueBookingResponse response = bookingMapper.toVenueBookingResponse(booking);
        response.setPaymentUrl(paymentUrl);
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
            } 
            else {
                log.warn("Payment service is disabled. Refund not processed.");
            }
        }
    }
}

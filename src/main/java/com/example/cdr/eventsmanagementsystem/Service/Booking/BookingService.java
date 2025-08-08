package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.CancelBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.CombinedBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.CombinedBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.BookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.AttendeeRepository;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.OrganizerRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.BookingNotificationService;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService implements IBookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ServiceRepository serviceRepository;
    private final AttendeeRepository attendeeRepository;
    private final OrganizerRepository organizerRepository;  
    private final BookingMapper bookingMapper;
    private final StripeService stripeService;
    private final BookingNotificationService notificationService;
    private final UserSyncService userSyncService;

    @Override
    @Transactional
    public EventBookingResponse bookEvent(EventBookingRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        Attendee attendee = userSyncService.ensureAttendeeExists();

        BigDecimal unitPrice = event.getRetailPrice() != null ? event.getRetailPrice() : new BigDecimal("50.00");
        BigDecimal totalAmount = unitPrice.multiply(new BigDecimal(request.getTicketQuantity()));

        Customer customer = stripeService.createCustomer(
            attendee.getEmail(), 
            attendee.getFullName(),
            null
        );

        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
            totalAmount,
            request.getPaymentDetails().getCurrency(),
            customer.getId(),
            "Event ticket for: " + event.getName()
        );

        Booking booking = bookingMapper.toBooking(request);
        booking.setEvent(event);
        booking.setAttendeeBooker(attendee);
        booking.setStatus(BookingStatus.PENDING); 
        booking.setStripePaymentId(paymentIntent.getId());
        booking.setStartTime(event.getStartTime());
        booking.setEndTime(event.getEndTime());
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.sendPaymentRequestEmail(savedBooking, paymentIntent.getClientSecret());
        
        EventBookingResponse response = bookingMapper.toEventBookingResponse(savedBooking);
        response.setPaymentUrl(buildPaymentUrl(savedBooking.getId(), paymentIntent.getClientSecret()));
        return response;
    }

    @Override
    @Transactional
    public VenueBookingResponse bookVenue(VenueBookingRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

        Organizer organizer = userSyncService.ensureOrganizerExists();

        Customer customer = stripeService.createCustomer(
            organizer.getEmail(),
            organizer.getFullName(),
            null
        );

        BigDecimal amount = BigDecimal.valueOf(venue.getPricing().getPerEvent());

        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
            amount,
            request.getCurrency() != null ? request.getCurrency() : "usd",
            customer.getId(),
            "Venue booking for: " + venue.getName()
        );

        Booking booking = bookingMapper.toBooking(request);
        booking.setVenue(venue);
        if (request.getEventId() != null) {
            Event ev = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
            booking.setEvent(ev);
        }
        booking.setOrganizerBooker(organizer);
        booking.setStatus(BookingStatus.PENDING); 
        booking.setStripePaymentId(paymentIntent.getId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.sendPaymentRequestEmail(savedBooking, paymentIntent.getClientSecret());

        VenueBookingResponse response = bookingMapper.toVenueBookingResponse(savedBooking);
        response.setPaymentUrl(buildPaymentUrl(savedBooking.getId(), paymentIntent.getClientSecret()));
        return response;
    }

    @Override
    @Transactional
    public ServiceBookingResponse bookService(ServiceBookingRequest request) {
        com.example.cdr.eventsmanagementsystem.Model.Service.Service service = 
                serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));

        Organizer organizer = userSyncService.ensureOrganizerExists();

        Customer customer = stripeService.createCustomer(
            organizer.getEmail(),
            organizer.getFullName(),
            null
        );

        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
            BigDecimal.valueOf(service.getPrice()),
            request.getCurrency() != null ? request.getCurrency() : "usd",
            customer.getId(),
            "Service booking for: " + service.getName()
        );

        Booking booking = bookingMapper.toBooking(request);
        booking.setService(service);
        if (request.getEventId() != null) {
            Event ev = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
            booking.setEvent(ev);
        }
        booking.setOrganizerBooker(organizer);
        booking.setStatus(BookingStatus.PENDING); 
        booking.setStripePaymentId(paymentIntent.getId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.sendPaymentRequestEmail(savedBooking, paymentIntent.getClientSecret());
        
        ServiceBookingResponse response = bookingMapper.toServiceBookingResponse(savedBooking);
        response.setPaymentUrl(buildPaymentUrl(savedBooking.getId(), paymentIntent.getClientSecret()));
        return response;
    }

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
                booking.setUpdatedAt(LocalDateTime.now());
                
                Booking savedBooking = bookingRepository.save(booking);
                notificationService.sendBookingConfirmationEmail(savedBooking);
                
                return bookingMapper.toBookingDetailsResponse(savedBooking);
            } else {
                notificationService.sendPaymentFailureEmail(booking, "Payment was not successful. Status: " + confirmedPayment.getStatus());
                throw new RuntimeException("Payment was not successful. Status: " + confirmedPayment.getStatus());
            }
        } catch (Exception e) {
            notificationService.sendPaymentFailureEmail(booking, e.getMessage());
            throw new RuntimeException("Payment failed: " + e.getMessage(), e);
        }
    }

    private String buildPaymentUrl(Long bookingId, String clientSecret) {
        return String.format("http://localhost:8080/payment-page?booking_id=%d&client_secret=%s", 
                            bookingId, clientSecret);
    }

    @Override
    @Transactional
    public CombinedBookingResponse bookResources(CombinedBookingRequest request) {
        CombinedBookingResponse response = new CombinedBookingResponse();
        response.setOrganizerId(request.getOrganizerId());
        response.setCreatedAt(LocalDateTime.now());

        if (request.getVenueId() != null) {
            VenueBookingRequest venueRequest = new VenueBookingRequest();
            venueRequest.setVenueId(request.getVenueId());
            venueRequest.setOrganizerId(request.getOrganizerId());
            venueRequest.setCurrency(request.getCurrency());
            venueRequest.setStartTime(request.getStartTime());
            venueRequest.setEndTime(request.getEndTime());

            VenueBookingResponse venueResponse = bookVenue(venueRequest);
            response.setVenueBookingId(venueResponse.getBookingId());
        }

        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
            List<Long> serviceBookingIds = request.getServiceIds().stream()
                    .map(serviceId -> {
                        ServiceBookingRequest serviceRequest = new ServiceBookingRequest();
                        serviceRequest.setServiceId(serviceId);
                        serviceRequest.setOrganizerId(request.getOrganizerId());
                        serviceRequest.setCurrency(request.getCurrency());
                        serviceRequest.setStartTime(request.getStartTime());
                        serviceRequest.setEndTime(request.getEndTime());

                        ServiceBookingResponse serviceResponse = bookService(serviceRequest);
                        return serviceResponse.getBookingId();
                    })
                    .collect(Collectors.toList());

            response.setServiceBookingIds(serviceBookingIds);
        }

        return response;
    }

    @Override
    @Transactional
    public void cancelBooking(CancelBookingRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        String currentUserId = userSyncService.getCurrentUserId();
        if (!booking.getBookerId().equals(currentUserId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

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

        notificationService.sendBookingCancellationEmail(savedBooking);
    }

    @Override
    public BookingDetailsResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        
        return bookingMapper.toBookingDetailsResponse(booking);
    }

    @Override
    public List<BookingDetailsResponse> getBookingsByAttendee(String attendeeId) {
        List<Booking> bookings = bookingRepository.findByBookerId(attendeeId);

        return bookings.stream()
                .map(bookingMapper::toBookingDetailsResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDetailsResponse> getBookingsByEvent(Long eventId) {
        List<Booking> bookings = bookingRepository.findByEvent_Id(eventId);

        return bookings.stream()
                .map(bookingMapper::toBookingDetailsResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingDetailsResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);
        
        if (oldStatus == BookingStatus.PENDING && status == BookingStatus.BOOKED) {
            notificationService.sendBookingConfirmationEmail(booking);
        }

        Booking savedBooking = bookingRepository.save(booking);

        return bookingMapper.toBookingDetailsResponse(savedBooking);
    }
}

package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.*;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.*;
import com.example.cdr.eventsmanagementsystem.Mapper.BookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
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
import com.example.cdr.eventsmanagementsystem.NotificationEvent.Payment.BookingPaymentFailed;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
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
    
    @Value("${app.paym ent.page-url:http://localhost:8080/payment-page}")
    private String paymentPageUrl;

    @Override
    @Transactional
    public EventBookingResponse bookEvent(EventBookingRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        Attendee attendee = userSyncService.ensureUserExists(Attendee.class);

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

        Booking savedBooking = bookingRepository.save(booking);

        eventPublisher.publishEvent(new EventBookingCreated(savedBooking));
        
        
        EventBookingResponse response = bookingMapper.toEventBookingResponse(savedBooking);
        response.setPaymentUrl(buildPaymentUrl(savedBooking.getId(), paymentIntent.getClientSecret()));
        return response;
    }

    @Override
    @Transactional
    public VenueBookingResponse bookVenue(VenueBookingRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

        Organizer organizer = userSyncService.ensureUserExists(Organizer.class);

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

        Booking savedBooking = bookingRepository.save(booking);

        eventPublisher.publishEvent(new VenueBookingCreated(savedBooking));
        

        VenueBookingResponse response = bookingMapper.toVenueBookingResponse(savedBooking);
        response.setPaymentUrl(buildPaymentUrl(savedBooking.getId(), paymentIntent.getClientSecret()));
        return response;
    }

    @Override
    @Transactional
    public ServiceBookingResponse bookService(ServiceBookingRequest request) {
        com.example.cdr.eventsmanagementsystem.Model.Service.Services service =
                serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));

        Organizer organizer = userSyncService.ensureUserExists(Organizer.class);

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

        Booking savedBooking = bookingRepository.save(booking);

        eventPublisher.publishEvent(new ServiceBookingCreated(savedBooking));
        
        
        ServiceBookingResponse response = bookingMapper.toServiceBookingResponse(savedBooking);
        response.setPaymentUrl(buildPaymentUrl(savedBooking.getId(), paymentIntent.getClientSecret()));
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

//    @Override
//    @Transactional
//    public CombinedBookingResponse bookResources(CombinedBookingRequest request) {
//        CombinedBookingResponse response = new CombinedBookingResponse();
//        response.setOrganizerId(request.getOrganizerId());
//
//        if (request.getVenueId() != null) {
//            VenueBookingRequest venueRequest = new VenueBookingRequest();
//            venueRequest.setVenueId(request.getVenueId());
//            venueRequest.setOrganizerId(request.getOrganizerId());
//            venueRequest.setCurrency(request.getCurrency());
//            venueRequest.setStartTime(request.getStartTime());
//            venueRequest.setEndTime(request.getEndTime());
//
//            VenueBookingResponse venueResponse = bookVenue(venueRequest);
//            response.setVenueBookingId(venueResponse.getBookingId());
//        }
//
//        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
//            List<Long> serviceBookingIds = request.getServiceIds().stream()
//                    .map(serviceId -> {
//                        ServiceBookingRequest serviceRequest = new ServiceBookingRequest();
//                        serviceRequest.setServiceId(serviceId);
//                        serviceRequest.setOrganizerId(request.getOrganizerId());
//                        serviceRequest.setCurrency(request.getCurrency());
//                        serviceRequest.setStartTime(request.getStartTime());
//                        serviceRequest.setEndTime(request.getEndTime());
//
//                        ServiceBookingResponse serviceResponse = bookService(serviceRequest);
//                        return serviceResponse.getBookingId();
//                    })
//                    .collect(Collectors.toList());
//
//            response.setServiceBookingIds(serviceBookingIds);
//        }
//
//        return response;
//    }

    @Override
    @Transactional
    public void cancelBooking(BookingCancelRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        String currentUserId = AuthUtil.getCurrentUserId();
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

        if (savedBooking.getVenue() != null) {
            eventPublisher.publishEvent(new VenueBookingCancelled(savedBooking, request.getReason()));
        } else if (savedBooking.getService() != null) {
            eventPublisher.publishEvent(new ServiceBookingCancelled(savedBooking, request.getReason()));
        } else if (savedBooking.getEvent() != null) {
            eventPublisher.publishEvent(new EventBookingCancelled(savedBooking, request.getReason()));
        }
        
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

package com.example.cdr.eventsmanagementsystem.Util;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.EventBookingMapper;
import com.example.cdr.eventsmanagementsystem.Mapper.ServiceBookingMapper;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueBookingMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.*;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingUtil {
    private final EventBookingRepository eventBookingRepository;
    private final VenueBookingRepository venueBookingRepository;
    private final ServiceBookingRepository serviceBookingRepository;
    private final EventBookingMapper eventBookingMapper;
    private final VenueBookingMapper venueBookingMapper;
    private final ServiceBookingMapper serviceBookingMapper;
    private final VenueRepository venueRepository;
    private final ServiceRepository serviceRepository;
    private final EventRepository eventRepository;

    public String getResourceName(Booking booking) {
        return switch (booking) {
            case VenueBooking venueBooking ->
                    venueRepository.findById(venueBooking.getVenueId())
                            .map(Venue::getName)
                            .orElse("Unknown Venue");
            case ServiceBooking serviceBooking ->
                    serviceRepository.findById(serviceBooking.getServiceId())
                            .map(Services::getName)
                            .orElse("Unknown Service");
            case EventBooking eventBooking ->
                    eventRepository.findById(eventBooking.getEventId())
                            .map(Event::getName)
                            .orElse("Unknown Event");
            default -> "Unknown Resource";
        };
    }

    public String getResourceType(Booking booking) {
        return switch (booking) {
            case VenueBooking v -> "VENUE";
            case ServiceBooking s -> "SERVICE";
            case EventBooking e -> "EVENT";
            default -> "Unknown Type";
        };
    }

    public void saveBooking(Booking booking) {
        switch (booking) {
            case VenueBooking venueBooking -> venueBookingRepository.save(venueBooking);
            case ServiceBooking serviceBooking -> serviceBookingRepository.save(serviceBooking);
            case EventBooking eventBooking -> eventBookingRepository.save(eventBooking);
            default -> throw new IllegalArgumentException("Unsupported booking type: " + booking.getClass().getName());
        }
    }

    public BookingResponse toBookingResponse(Booking booking) {
        return switch (booking) {
            case EventBooking eventBooking -> eventBookingMapper.toEventBookingResponse(eventBooking);
            case VenueBooking venueBooking -> venueBookingMapper.toVenueBookingResponse(venueBooking);
            case ServiceBooking serviceBooking -> serviceBookingMapper.toServiceBookingResponse(serviceBooking);
            default -> throw new IllegalArgumentException("Unsupported booking type: " + booking.getClass().getName());
        };
    }

    public Booking findBookingByTypeAndId(Long bookingId, BookingType type) {
        return switch (type) {
            case EVENT -> eventBookingRepository.findById(bookingId)
                    .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
            case VENUE -> venueBookingRepository.findById(bookingId)
                    .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
            case SERVICE -> serviceBookingRepository.findById(bookingId)
                    .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        };
    }

    public Booking findBookingByStripeSessionIdAndType(String sessionId, BookingType type) {
        return switch (type) {
            case EVENT -> eventBookingRepository.findByStripeSessionId(sessionId);
            case VENUE -> venueBookingRepository.findByStripeSessionId(sessionId);
            case SERVICE -> serviceBookingRepository.findByStripeSessionId(sessionId);
        };
    }

    public Booking findBookingByStripePaymentIdAndType(String paymentId, BookingType type) {
        return switch (type) {
            case EVENT -> eventBookingRepository.findByStripePaymentId(paymentId);
            case VENUE -> venueBookingRepository.findByStripePaymentId(paymentId);
            case SERVICE -> serviceBookingRepository.findByStripePaymentId(paymentId);
        };
    }

    public String mapToStripeRefundReason(String reason) {
        return switch (reason.toLowerCase()) {
            case "duplicate" -> "duplicate";
            case "fraudulent" -> "fraudulent";
            case "requested_by_customer", "customer requested cancellation" -> "requested_by_customer";
            default -> "requested_by_customer"; // fallback for any other string
        };
    }
}

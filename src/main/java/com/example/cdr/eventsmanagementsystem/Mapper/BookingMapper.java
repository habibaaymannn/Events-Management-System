package com.example.cdr.eventsmanagementsystem.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", constant = "EVENT")
    @Mapping(target = "bookerId", ignore = true)
    @Mapping(target = "bookerType", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "service", ignore = true)
    @Mapping(target = "stripePaymentId", ignore = true)
    @Mapping(target = "refundAmount", ignore = true)
    @Mapping(target = "refundProcessedAt", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)
    @Mapping(target = "stripeSessionId", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(source = "eventId", target = "event.id")
    @Mapping(target = "attendeeBooker", ignore = true)
    @Mapping(target = "organizerBooker", ignore = true)
    Booking toBooking(EventBookingRequest request);

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "bookerId", target = "attendeeId")
    @Mapping(target = "paymentUrl", ignore = true)
    @Mapping(target = "paymentConfirmation", ignore = true)
    EventBookingResponse toEventBookingResponse(Booking booking);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", constant = "VENUE")
    @Mapping(target = "bookerId", ignore = true)
    @Mapping(target = "bookerType", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "service", ignore = true)
    @Mapping(target = "stripePaymentId", ignore = true)
    @Mapping(target = "refundAmount", ignore = true)
    @Mapping(target = "refundProcessedAt", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)
    @Mapping(target = "stripeSessionId", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(source = "venueId", target = "venue.id")
    @Mapping(source = "eventId", target = "event.id")
    @Mapping(target = "attendeeBooker", ignore = true)
    @Mapping(target = "organizerBooker", ignore = true)
    Booking toBooking(VenueBookingRequest request);

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "bookerId", target = "organizerId")     
    @Mapping(target = "paymentUrl", ignore = true)
    VenueBookingResponse toVenueBookingResponse(Booking booking);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", constant = "SERVICE")
    @Mapping(target = "bookerId", ignore = true)      
    @Mapping(target = "bookerType", ignore = true)    
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "stripePaymentId", ignore = true)
    @Mapping(target = "refundAmount", ignore = true)
    @Mapping(target = "refundProcessedAt", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)   
    @Mapping(target = "stripeSessionId", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(source = "serviceId", target = "service.id")
    @Mapping(source = "eventId", target = "event.id")
    Booking toBooking(ServiceBookingRequest request);

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "bookerId", target = "organizerId")      
    @Mapping(target = "paymentUrl", ignore = true)
    ServiceBookingResponse toServiceBookingResponse(Booking booking);

    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "bookerId", target = "bookerId")
    @Mapping(source = "bookerType", target = "bookerType")
    BookingDetailsResponse toBookingDetailsResponse(Booking booking);
}
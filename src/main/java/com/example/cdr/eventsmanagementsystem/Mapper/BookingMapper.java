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
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "refundAmount", ignore = true)
    @Mapping(target = "refundProcessedAt", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "cancelledBy", ignore = true)
    @Mapping(source = "eventId", target = "event.id")
    Booking toBooking(EventBookingRequest request);

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "bookerId", target = "attendeeId")       
    @Mapping(source = "stripePaymentId", target = "paymentConfirmation")
    @Mapping(source = "createdAt", target = "createdAt")
    EventBookingResponse toEventBookingResponse(Booking booking);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", constant = "VENUE")
    @Mapping(target = "bookerId", ignore = true)
    @Mapping(target = "bookerType", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "service", ignore = true)
    @Mapping(target = "stripePaymentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "refundAmount", ignore = true)
    @Mapping(target = "refundProcessedAt", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "cancelledBy", ignore = true)
    @Mapping(source = "venueId", target = "venue.id")
    @Mapping(source = "eventId", target = "event.id")
    Booking toBooking(VenueBookingRequest request);

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "bookerId", target = "organizerId")     
    @Mapping(source = "createdAt", target = "createdAt")
    VenueBookingResponse toVenueBookingResponse(Booking booking);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", constant = "SERVICE")
    @Mapping(target = "bookerId", ignore = true)      
    @Mapping(target = "bookerType", ignore = true)    
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "stripePaymentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "refundAmount", ignore = true)
    @Mapping(target = "refundProcessedAt", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "cancelledBy", ignore = true)
    @Mapping(source = "serviceId", target = "service.id")
    @Mapping(source = "eventId", target = "event.id")
    Booking toBooking(ServiceBookingRequest request);

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "bookerId", target = "organizerId")      
    @Mapping(source = "createdAt", target = "createdAt")
    ServiceBookingResponse toServiceBookingResponse(Booking booking);

    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "bookerId", target = "bookerId")          
    @Mapping(source = "bookerType", target = "bookerType")      
    BookingDetailsResponse toBookingDetailsResponse(Booking booking);
}
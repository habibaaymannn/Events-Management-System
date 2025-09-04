package com.example.eventsmanagementsystem.Mapper;

import com.example.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.eventsmanagementsystem.Model.Booking.VenueBooking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VenueBookingMapper {
    @Mapping(source = "venueId", target = "venueId")
    @Mapping(source = "eventId", target = "eventId")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "endTime", target = "endTime")
    @Mapping(source = "amount", target = "amount")
    @Mapping(target = "status", constant = "PENDING")
    VenueBooking toVenueBooking(VenueBookingRequest request);

    @Mapping(source = "venueId", target = "venueId")
    @Mapping(source = "eventId", target = "eventId")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "endTime", target = "endTime")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "status", target = "status")
    VenueBookingResponse toVenueBookingResponse(VenueBooking venueBooking);
}

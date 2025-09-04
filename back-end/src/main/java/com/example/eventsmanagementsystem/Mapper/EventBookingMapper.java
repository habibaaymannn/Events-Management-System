package com.example.eventsmanagementsystem.Mapper;

import com.example.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.eventsmanagementsystem.Model.Booking.EventBooking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventBookingMapper {
    @Mapping(source = "eventId", target = "eventId")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "endTime", target = "endTime")
    @Mapping(source = "amount", target = "amount")
    @Mapping(target = "status", constant = "PENDING")
    EventBooking toEventBooking(EventBookingRequest request);

    @Mapping(source = "eventId", target = "eventId")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "endTime", target = "endTime")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "status", target = "status")
    EventBookingResponse toEventBookingResponse(EventBooking eventBooking);
}

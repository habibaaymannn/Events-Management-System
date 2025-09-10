package com.example.cdr.eventsmanagementsystem.Mapper;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ServiceBookingMapper {
    @Mapping(source = "serviceId", target = "serviceId")
    @Mapping(source = "eventId", target = "eventId")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "endTime", target = "endTime")
    @Mapping(source = "amount", target = "amount")
    @Mapping(target = "status", constant = "PENDING")
    ServiceBooking toServiceBooking(ServiceBookingRequest request);

    @Mapping(source = "serviceId", target = "serviceId")
    @Mapping(source = "eventId", target = "eventId")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "endTime", target = "endTime")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "status", target = "status")
    ServiceBookingResponse toServiceBookingResponse(ServiceBooking serviceBooking);
}

package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Constants.BookingControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.Service.Booking.BookingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Booking - Services", description = "Service booking APIs")
public class ServiceBookingController extends BookingController{
    private final BookingService bookingService;

    @Operation(summary = "Book a service", description = "Creates a new service booking for an organizer. Use 'authorizeOnly=true' for 'Reserve Now, Pay Later' or 'authorizeOnly=false' for immediate payment.")
    @PostMapping(BookingControllerConstants.SERVICE_BOOKING)
    @PreAuthorize("hasRole('" + RoleConstants.ORGANIZER_ROLE + "')")
    public ResponseEntity<ServiceBookingResponse> bookService(
            @RequestBody ServiceBookingRequest request) {
        ServiceBookingResponse response = bookingService.bookService(request);
        return ResponseEntity.ok(response);
    }

}

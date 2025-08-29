package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.Service.Booking.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for booking.
 * Provides endpoint to book an event by attendees
 */

@RestController
@RequiredArgsConstructor
@Tag(name = "Booking - Events", description = "Event booking APIs")
public class EventBookingController extends BookingController{
    private final BookingService bookingService;

    @Operation(summary = "Book an event", description = "Creates a new event booking for an attendee")
    @PostMapping(BookingControllerConstants.EVENT_BOOKING)
    @PreAuthorize("hasRole('" + RoleConstants.ATTENDEE_ROLE + "')")
    public ResponseEntity<EventBookingResponse> bookEvent(
            @RequestBody EventBookingRequest request) {
        EventBookingResponse response = bookingService.bookEvent(request);
        return ResponseEntity.ok(response);
    }
}

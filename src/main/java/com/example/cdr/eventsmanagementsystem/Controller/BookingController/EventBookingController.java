package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Booking.EventBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants.*;
import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.*;

/**
 * REST controller for booking.
 * Provides endpoint to book an event by attendees
 */

@RestController
@RequestMapping(EVENT_BOOKING)
@RequiredArgsConstructor
@Tag(name = "Event Booking", description = "Event booking APIs")
public class EventBookingController {
    private final EventBookingService bookingService;


    @Operation(summary = "Get booking details by ID", description = "Retrieves details of a booking by its ID")
    @GetMapping(GET_BOOKING_BY_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ATTENDEE_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<EventBookingResponse> getBookingById(@PathVariable Long bookingId) {
        EventBookingResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create an event booking", description = "Creates a new event booking for an attendee. Creates a new event booking for an attendee. Use 'authorizeOnly=true' for 'Reserve Now, Pay Later' or 'authorizeOnly=false' for immediate payment.")
    @PostMapping()
    @PreAuthorize("hasAnyRole('" + ATTENDEE_ROLE + "', '" + ADMIN_ROLE + "')")
    public ResponseEntity<EventBookingResponse> createBooking(@RequestBody EventBookingRequest request) {
        EventBookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update booking status", description = "Updates the status of a booking")
    @PutMapping(UPDATE_BOOKING_STATUS)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<EventBookingResponse> updateBookingStatus(@PathVariable Long bookingId, @PathVariable BookingStatus status) {
        EventBookingResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Cancel a booking", description = "Cancels an existing booking")
    @PostMapping(CANCEL_BOOKING)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ATTENDEE_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Void> cancelBooking(@RequestBody BookingCancelRequest request) {
        bookingService.cancelBooking(request);
        return ResponseEntity.ok().build();
    }
}

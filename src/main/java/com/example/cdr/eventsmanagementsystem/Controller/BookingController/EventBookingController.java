package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Booking.EventBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    @Operation(summary = "Get all bookings", description = "Retrieves all bookings")
    @GetMapping(GET_ALL)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ATTENDEE_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<EventBookingResponse>> getAllBookings(@PageableDefault() Pageable pageable) {
        Page<EventBookingResponse> response = bookingService.getAllEventBookings(pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all bookings by event ID", description = "Retrieves all bookings by event ID")
    @GetMapping(GET_BOOKING_BY_EVENT_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ATTENDEE_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<EventBookingResponse>> getAllBookingsByEventId(@PathVariable Long eventId, @PageableDefault() Pageable pageable) {
        Page<EventBookingResponse> response = bookingService.getAllEventBookingsByEventId(eventId, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all bookings by attendee ID", description = "Retrieves all bookings by attendee ID")
    @GetMapping(GET_BOOKING_BY_ATTENDEE_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ATTENDEE_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<EventBookingResponse>> getAllBookingsByAttendeeId(@PathVariable String attendeeId, @PageableDefault() Pageable pageable) {
        Page<EventBookingResponse> response = bookingService.getAllEventBookingsByAttendeeId(attendeeId, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get booking details by ID", description = "Retrieves details of a booking by its ID")
    @GetMapping(GET_BOOKING_BY_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ATTENDEE_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<EventBookingResponse> getBookingById(@PathVariable Long bookingId) {
        EventBookingResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create an event booking", description = "Creates a new event booking for an attendee. Creates a new event booking for an attendee. Use 'authorizeOnly=true' for 'Reserve Now, Pay Later' or 'authorizeOnly=false' for immediate payment.")
    @PostMapping(CREATE_BOOKING)
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

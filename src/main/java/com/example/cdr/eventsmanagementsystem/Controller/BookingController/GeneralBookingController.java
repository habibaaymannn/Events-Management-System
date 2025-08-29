package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Booking.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for general booking operations.
 * Provides endpoints to cancel bookings, retrieve booking details, get bookings by attendee,
 * and update booking status.
 */

@RestController
@RequiredArgsConstructor
@Tag(name = "Booking - General", description = "General booking operations")
public class GeneralBookingController extends BookingController{
    private final BookingService bookingService;

    @Operation(summary = "Cancel a booking", description = "Cancels an existing booking")
    @PostMapping(BookingControllerConstants.CANCEL_BOOKING)
    @PreAuthorize("hasAnyRole('" + RoleConstants.ORGANIZER_ROLE + "', '" + RoleConstants.ATTENDEE_ROLE +  "','" +
            RoleConstants.VENUE_PROVIDER_ROLE + "','" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    public ResponseEntity<Void> cancelBooking(
            @RequestBody BookingCancelRequest request) {
        bookingService.cancelBooking(request);
        return ResponseEntity.ok().build();
    }
    @Operation(summary = "Get booking details by ID", description = "Retrieves details of a booking by its ID")
    @GetMapping(BookingControllerConstants.GET_BOOKING_BY_ID)
    @PreAuthorize("hasAnyRole('" + RoleConstants.ORGANIZER_ROLE + "', '" + RoleConstants.ATTENDEE_ROLE + "','" + RoleConstants.ADMIN_ROLE + "')")
    public ResponseEntity<BookingDetailsResponse> getBooking(@PathVariable Long bookingId) {
        BookingDetailsResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }
    @Operation(summary = "Get bookings by attendee ID", description = "Retrieves all bookings for a specific attendee")
    @GetMapping(BookingControllerConstants.GET_BOOKINGS_BY_ATTENDEE)
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN_ROLE + "', '" + RoleConstants.ATTENDEE_ROLE + "')")
    public ResponseEntity<List<BookingDetailsResponse>> getBookingsByAttendee(
            @PathVariable String attendeeId) {
        List<BookingDetailsResponse> responses = bookingService.getBookingsByAttendee(attendeeId);
        return ResponseEntity.ok(responses);
    }
    @Operation(summary = "Update booking status", description = "Updates the status of a booking")
    @PutMapping(BookingControllerConstants.UPDATE_BOOKING_STATUS)
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
    public ResponseEntity<BookingDetailsResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @PathVariable BookingStatus status) {
        BookingDetailsResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(response);
    }
}

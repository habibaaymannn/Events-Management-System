package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Booking.VenueBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants.*;
import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.*;

/**
 * REST controller for booking.
 * Provides endpoint to book a venue by organizers
 */
@RestController
@RequestMapping(VENUE_BOOKING)
@RequiredArgsConstructor
@Tag(name = "Venue Booking", description = "Venue booking APIs")
public class VenueBookingController {
    private final VenueBookingService bookingService;

    @Operation(summary = "Get all bookings", description = "Retrieves all bookings")
    @GetMapping(GET_ALL)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + VENUE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<VenueBookingResponse>> getAllBookings(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<VenueBookingResponse> response = bookingService.getAllVenueBookings(Pageable.ofSize(size).withPage(page));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all bookings by organizer ID", description = "Retrieves all bookings by organizer ID")
    @GetMapping(GET_ALL_VENUE_BOOKINGS_BY_ORGANIZER_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + VENUE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<VenueBookingResponse>> getAllVenueBookingsByOrganizerId(@PathVariable String organizerId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<VenueBookingResponse> response = bookingService.getAllVenueBookingsByOrganizerId(organizerId, Pageable.ofSize(size).withPage(page));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all bookings by venue provider ID", description = "Retrieves all bookings by venue provider ID")
    @GetMapping(GET_ALL_VENUE_BOOKINGS_BY_VENUE_PROVIDER_ID)
    @PreAuthorize("hasAnyRole('" + VENUE_PROVIDER_ROLE + "', '" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<VenueBookingResponse>> getAllVenueBookingsByVenueProviderId(@PathVariable String venueProviderId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<VenueBookingResponse> response = bookingService.getAllVenueBookingsByVenueProviderId(venueProviderId, Pageable.ofSize(size).withPage(page));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get booking details by ID", description = "Retrieves details of a booking by its ID")
    @GetMapping(GET_BOOKING_BY_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + VENUE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<VenueBookingResponse> getBookingById(@PathVariable Long bookingId) {
        VenueBookingResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create a venue booking", description = "Creates a new venue booking for an organizer. Use 'authorizeOnly=true' for 'Reserve Now, Pay Later' or 'authorizeOnly=false' for immediate payment.")
    @PostMapping(CREATE_BOOKING)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ADMIN_ROLE + "')")
    public ResponseEntity<VenueBookingResponse> createBooking(@RequestBody VenueBookingRequest request) {
        VenueBookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update booking status", description = "Updates the status of a booking")
    @PutMapping(UPDATE_BOOKING_STATUS)
    @PreAuthorize("hasAnyRole('" + VENUE_PROVIDER_ROLE + "', '" + ADMIN_ROLE + "')")
    public ResponseEntity<VenueBookingResponse> updateBookingStatus(@PathVariable Long bookingId, @PathVariable BookingStatus status) {
        VenueBookingResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Cancel a booking", description = "Cancels an existing booking")
    @PostMapping(CANCEL_BOOKING)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + VENUE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Void> cancelBooking(@RequestBody BookingCancelRequest request) {
        bookingService.cancelBooking(request);
        return ResponseEntity.ok().build();
    }
}

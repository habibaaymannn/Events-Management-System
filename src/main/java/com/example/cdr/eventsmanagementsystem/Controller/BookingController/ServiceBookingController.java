package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants.*;
import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.ADMIN_ROLE;
import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.ORGANIZER_ROLE;
import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.SERVICE_PROVIDER_ROLE;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Booking.ServiceBookingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for booking.
 * Provides endpoint to book a service by organizers
 */
@RestController
@RequestMapping(SERVICE_BOOKING)
@RequiredArgsConstructor
@Tag(name = "Service Booking", description = "Service booking APIs")
public class ServiceBookingController {
    private final ServiceBookingService bookingService;

    @Operation(summary = "Get all bookings", description = "Retrieves all bookings")
    @GetMapping(GET_ALL)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + SERVICE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<ServiceBookingResponse>> getAllBookings(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<ServiceBookingResponse> response = bookingService.getAllServiceBookings(Pageable.ofSize(size).withPage(page));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all bookings by organizer ID", description = "Retrieves all bookings by organizer ID")
    @GetMapping(GET_ALL_SERVICE_BOOKINGS_BY_ORGANIZER_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + SERVICE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Page<ServiceBookingResponse>> getAllServiceBookingsByOrganizerId(@PathVariable String organizerId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<ServiceBookingResponse> response = bookingService.getAllServiceBookingsByOrganizerId(organizerId, Pageable.ofSize(size).withPage(page));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get booking details by ID", description = "Retrieves details of a booking by its ID")
    @GetMapping(GET_BOOKING_BY_ID)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + SERVICE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<ServiceBookingResponse> getBookingById(@PathVariable Long bookingId) {
        ServiceBookingResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create a service booking", description = "Creates a new service booking for an organizer. Use 'authorizeOnly=true' for 'Reserve Now, Pay Later' or 'authorizeOnly=false' for immediate payment.")
    @PostMapping(CREATE_BOOKING)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + ADMIN_ROLE + "')")
    public ResponseEntity<ServiceBookingResponse> createBooking(@RequestBody ServiceBookingRequest request) {
        ServiceBookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update booking status", description = "Updates the status of a booking")
    @PutMapping(UPDATE_BOOKING_STATUS)
    @PreAuthorize("hasAnyRole('" + SERVICE_PROVIDER_ROLE + "', '" + ADMIN_ROLE + "')")
    public ResponseEntity<ServiceBookingResponse> updateBookingStatus(@PathVariable Long bookingId, @PathVariable BookingStatus status) {
        ServiceBookingResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Cancel a booking", description = "Cancels an existing booking")
    @PostMapping(CANCEL_BOOKING)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "', '" + SERVICE_PROVIDER_ROLE + "','" + ADMIN_ROLE + "')")
    public ResponseEntity<Void> cancelBooking(@RequestBody BookingCancelRequest request) {
        bookingService.cancelBooking(request);
        return ResponseEntity.ok().build();
    }
}

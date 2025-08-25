package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Service.Booking.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Booking - Venues", description = "Venue booking APIs")
public class VenueBookingController extends BookingController{
    private final BookingService bookingService;

    @Operation(summary = "Book a venue", description = "Creates a new venue booking for an organizer")
    @PostMapping(BookingControllerConstants.VENUE_BOOKING)
    @PreAuthorize("hasRole('" + RoleConstants.ORGANIZER_ROLE + "')")
    public ResponseEntity<VenueBookingResponse> bookVenue(
            @RequestBody VenueBookingRequest request) {
        VenueBookingResponse response = bookingService.bookVenue(request);
        return ResponseEntity.ok(response);
    }
}

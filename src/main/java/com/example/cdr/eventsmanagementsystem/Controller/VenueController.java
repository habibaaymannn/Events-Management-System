package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueServiceInterface;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Constants.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping(VenueControllerConstants.VENUE_BASE_URL)
@Tag(name = "Venue", description = "Venue management APIs")
public class VenueController {
    private final VenueServiceInterface venueService;

    @Operation(summary = "Create a new venue", description = "Creates a new venue for the venue provider")
    @PreAuthorize("hasRole('" + RoleConstants.VENUE_PROVIDER_ROLE + "')")
    @PostMapping(VenueControllerConstants.CREATE_VENUE_URL)
    public ResponseEntity<VenueDTO> createVenue(@Valid @RequestBody VenueDTO dto) {
        VenueDTO venue = venueService.addVenue(dto);
        return ResponseEntity.ok(venue);
    }

    @Operation(summary = "Update an existing venue", description = "Updates the details of a venue by ID")
    @PreAuthorize("hasRole('" + RoleConstants.VENUE_PROVIDER_ROLE + "')")
    @PutMapping(VenueControllerConstants.UPDATE_VENUE_URL)
    public ResponseEntity<VenueDTO> updateVenue(@PathVariable Long venueId, @Valid @RequestBody VenueDTO dto){
        VenueDTO updatedVenue = venueService.updateVenue(venueId, dto);
        return ResponseEntity.ok(updatedVenue);
    }

    @Operation(summary = "Delete a venue", description = "Deletes a venue by its ID")
    @PreAuthorize("hasRole('" + RoleConstants.VENUE_PROVIDER_ROLE + "')")
    @DeleteMapping(VenueControllerConstants.DELETE_VENUE_URL)
    public ResponseEntity<Void> deleteVenue(@PathVariable Long venueId) {
        venueService.deleteVenue(venueId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all booked venues for a venue provider", description = "Retrieves all venue bookings associated with a specific venue provider")
    @PreAuthorize("hasRole('" + RoleConstants.VENUE_PROVIDER_ROLE + "')")
    @GetMapping(VenueControllerConstants.GET_VENUE_BOOKINGS_URL)
    public ResponseEntity<Page<BookingDetailsResponse>> getVenueBookings(Pageable pageable) {
         Page<BookingDetailsResponse> bookings = venueService.getBookingsForVenueProvider(pageable);
         return ResponseEntity.ok(bookings);
    }

    @Operation(summary = "Cancel a booking as a venue provider")
    @PreAuthorize("hasRole('" + RoleConstants.VENUE_PROVIDER_ROLE + "')")
    @PostMapping(VenueControllerConstants.CANCEL_VENUE_BOOKING_URL)
    public ResponseEntity<Void> cancelVenueBooking(@PathVariable Long bookingId) {
        venueService.cancelBooking(bookingId);
        return ResponseEntity.ok().build();
    }
}
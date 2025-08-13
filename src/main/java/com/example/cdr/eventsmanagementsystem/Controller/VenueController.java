package com.example.cdr.eventsmanagementsystem.Controller;

import java.nio.file.AccessDeniedException;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/venues")
@Tag(name = "Venue", description = "Venue management APIs")
public class VenueController {
    private final VenueService venueService;

    @Operation(summary = "Create a new venue", description = "Creates a new venue for the venue provider")
    @PreAuthorize("hasRole('venue provider')")
    @PostMapping
    public ResponseEntity<VenueDTO> create(@Valid @RequestBody VenueDTO dto) {
        VenueDTO venue = venueService.addVenue(dto);
        return ResponseEntity.ok(venue);
    }

    @Operation(summary = "Update an existing venue", description = "Updates the details of a venue by ID")
    @PreAuthorize("hasRole('venue provider')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueDTO> update(@PathVariable Long id, @Valid @RequestBody VenueDTO dto) throws AccessDeniedException {
        VenueDTO updatedVenue = venueService.updateVenue(id, dto);
        return ResponseEntity.ok(updatedVenue);
    }

    @Operation(summary = "Delete a venue", description = "Deletes a venue by its ID")
    @PreAuthorize("hasRole('venue provider')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws AccessDeniedException {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }

    //use booking dto instead
    @Operation(summary = "Get all booked venues for a venue provider", description = "Retrieves all venue bookings associated with a specific venue provider")
    @PreAuthorize("hasRole('venue provider')")
    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingDetailsResponse>> getBookings(Pageable pageable) {
         Page<BookingDetailsResponse> bookings = venueService.getBookingsForVenueProvider(pageable);
         return ResponseEntity.ok(bookings);
    }

    @Operation(summary = "Cancel a booking as a venue provider")
    @PreAuthorize("hasRole('venue provider')")
    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) throws AccessDeniedException {
        venueService.cancelBooking(bookingId);
        return ResponseEntity.ok().build();
    }
}
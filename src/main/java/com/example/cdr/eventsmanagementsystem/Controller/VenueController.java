package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.nio.file.AccessDeniedException;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/venues")
@Tag(name = "Venue", description = "Venue management APIs")
public class VenueController {
    private final IVenueService venueService;

    @Operation(summary = "Create a new venue", description = "Creates a new venue for the venue provider")
    @PreAuthorize("hasRole('venue provider')")
    @PostMapping
    public Venue create(@RequestBody VenueDTO dto) {
        return venueService.addVenue(dto);
    }

    @Operation(summary = "Update an existing venue", description = "Updates the details of a venue by ID")
    @PreAuthorize("hasRole('venue provider')")
    @PutMapping("/{id}")
    public Venue update(@PathVariable Long id, @RequestBody VenueDTO dto) {
        return venueService.updateVenue(id, dto);
    }

    @Operation(summary = "Delete a venue", description = "Deletes a venue by its ID")
    @PreAuthorize("hasRole('venue provider')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        venueService.deleteVenue(id);
    }

    @Operation(summary = "Get all venues for a venue provider", description = "Retrieves all venues associated with a specific venue provider")
    @PreAuthorize("hasRole('venue provider')")
    @GetMapping
    public ResponseEntity<List<Booking>> getBookings() {
         List<Booking> bookings = venueService.getBookingsForVenueProvider();
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
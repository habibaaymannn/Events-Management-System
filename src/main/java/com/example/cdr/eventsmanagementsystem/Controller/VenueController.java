package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.VenueControllerConstants;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.*;

/**
 * REST controller for venue management.
 * Provides endpoints to create, update, delete venues, update venue availability,
 * and retrieve venue bookings for venue providers.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(VenueControllerConstants.VENUE_BASE_URL)
@PreAuthorize("hasRole('" + VENUE_PROVIDER_ROLE + "')")
@Tag(name = "Venue", description = "Venue management APIs")
public class VenueController {
    private final VenueService venueService;

    @Operation(summary = "Get venue by ID", description = "Retrieves venue details by its ID")
    @GetMapping(VenueControllerConstants.GET_VENUE_BY_ID_URL)
    public VenueDTO getVenueById(@PathVariable Long id) {
        return venueService.getVenueById(id);
    }

    @Operation(summary = "Get venues by venue provider", description = "Return all venues related to a venue provider")
    @GetMapping(VenueControllerConstants.GET_VENUES_BY_PROVIDER_URL)
    public Page<VenueDTO> getVenuesByVenueProvider(@ParameterObject @PageableDefault() Pageable pageable) {
        return venueService.getVenuesByVenueProvider(pageable);
    }

    @Operation(summary = "Get all venues", description = "Retrieves a paginated list of all venues")
    @GetMapping(VenueControllerConstants.GET_ALL_VENUES_URL)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE +  "','" + ADMIN_ROLE + "')")
    public Page<VenueDTO> getAllVenues(@ParameterObject @PageableDefault() Pageable pageable) {
        return venueService.getAllVenues(pageable);
    }

    @Operation(summary = "Create a new venue", description = "Creates a new venue for the venue provider")
    @PostMapping(path = VenueControllerConstants.CREATE_VENUE_URL, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueDTO> createVenue(@Valid @RequestPart("venue") VenueDTO dto, @RequestPart(value = "images", required = false) List<MultipartFile> imgFiles) throws IOException {
        VenueDTO venue = venueService.addVenue(dto, imgFiles);
        return ResponseEntity.ok(venue);
    }

    @Operation(summary = "Update an existing venue", description = "Updates the details of a venue by ID")
    @PutMapping(VenueControllerConstants.UPDATE_VENUE_URL)
    public ResponseEntity<VenueDTO> updateVenue(@PathVariable Long venueId, @Valid @RequestPart("venue") VenueDTO dto, @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages) throws IOException {
        VenueDTO updatedVenue = venueService.updateVenue(venueId, dto, newImages);
        return ResponseEntity.ok(updatedVenue);
    }

    @Operation(summary = "Delete a venue", description = "Deletes a venue by its ID")
    @DeleteMapping(VenueControllerConstants.DELETE_VENUE_URL)
    public ResponseEntity<Void> deleteVenue(@PathVariable Long venueId) {
        venueService.deleteVenue(venueId);
        return ResponseEntity.noContent().build();
    }
}
package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.DTO.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/venues")
public class VenueController {
    private final VenueService venueService;

    @PreAuthorize("hasRole('venue_provider')")
    @PostMapping
    public Venue create(@RequestBody VenueDTO dto) {
        return venueService.addVenue(dto);
    }
    @PreAuthorize("hasRole('venue_provider')")
    @PutMapping("/{id}")
    public Venue update(@PathVariable Long id, @RequestBody VenueDTO dto) throws AccessDeniedException {
        return venueService.updateVenue(id, dto);
    }
    @PreAuthorize("hasRole('venue_provider')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        venueService.deleteVenue(id);
    }

}

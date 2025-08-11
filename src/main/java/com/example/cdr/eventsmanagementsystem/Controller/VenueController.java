package com.example.cdr.eventsmanagementsystem.Controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.DTO.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Service.Venue.IVenueService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/venues")
public class VenueController {
    private final IVenueService venueService;

    // @PreAuthorize("hasRole('venue_provider')")
    @PostMapping
    public Venue create(@RequestBody VenueDTO dto) {
        return venueService.addVenue(dto);
    }
    // @PreAuthorize("hasRole('venue_provider')")
    @PutMapping("/{id}")
    public Venue update(@PathVariable Long id, @RequestBody VenueDTO dto) {
        return venueService.updateVenue(id, dto);
    }
    // @PreAuthorize("hasRole('venue_provider')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        venueService.deleteVenue(id);
    }

}

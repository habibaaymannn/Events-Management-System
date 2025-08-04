package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/venues")
public class VenueController {
    private final VenueService venueService;

    @PostMapping()
    public Venue create(@RequestBody VenueDTO dto) {
        return venueService.addVenue(dto);
    }
    @PutMapping("/{id}")
    public Venue update(@PathVariable Long id, @RequestBody VenueDTO dto) {
        return venueService.updateVenue(id, dto);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        venueService.deleteVenue(id);
    }
}

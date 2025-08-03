package com.example.cdr.eventsmanagementsystem.Controller.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueProvider;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class VenueController {
    private final VenueProvider venueProvider;
    public VenueController(VenueProvider venueProvider){
        this.venueProvider = venueProvider;
    }

    @PostMapping("/venues")
    public Venue create(@RequestBody VenueDTO dto) {
        return venueProvider.addVenue(dto);
    }
}

package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;

public interface IVenueService {
    Venue addVenue(VenueDTO dto);
    Venue updateVenue(Long id, VenueDTO dto);
    void deleteVenue(Long id);
}



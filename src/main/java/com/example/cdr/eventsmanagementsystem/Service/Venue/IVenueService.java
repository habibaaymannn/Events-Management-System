package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;

import java.nio.file.AccessDeniedException;

public interface IVenueService {
    Venue addVenue(VenueDTO dto);
    Venue updateVenue(Long id, VenueDTO dto) throws AccessDeniedException;
    void deleteVenue(Long id);
}

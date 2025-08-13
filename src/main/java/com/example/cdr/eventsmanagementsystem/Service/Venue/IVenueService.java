package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;

import java.nio.file.AccessDeniedException;

public interface IVenueService {
    VenueDTO addVenue(VenueDTO dto);
    VenueDTO updateVenue(Long id, VenueDTO dto) throws AccessDeniedException;
    void deleteVenue(Long id) throws AccessDeniedException;
    void cancelBooking(Long bookingId) throws AccessDeniedException;
}

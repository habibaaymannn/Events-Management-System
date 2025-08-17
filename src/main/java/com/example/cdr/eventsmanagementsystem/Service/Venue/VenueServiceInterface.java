package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;

import java.nio.file.AccessDeniedException;

public interface VenueServiceInterface {
    VenueDTO addVenue(VenueDTO dto);
    VenueDTO updateVenue(Long id, VenueDTO dto) throws AccessDeniedException;
    void deleteVenue(Long id) throws AccessDeniedException;
    void cancelBooking(Long bookingId) throws AccessDeniedException;
}

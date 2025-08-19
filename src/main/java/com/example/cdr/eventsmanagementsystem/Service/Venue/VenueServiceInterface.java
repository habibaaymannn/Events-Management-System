package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing venues and their bookings.
 */

public interface VenueServiceInterface {
    VenueDTO addVenue(VenueDTO dto);
    VenueDTO updateVenue(Long id, VenueDTO dto);
    void deleteVenue(Long id);
    Page<BookingDetailsResponse> getBookingsForVenueProvider(Pageable pageable);
    void cancelBooking(Long bookingId);
}

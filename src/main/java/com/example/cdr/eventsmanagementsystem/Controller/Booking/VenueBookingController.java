package com.example.cdr.eventsmanagementsystem.Controller.Booking;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Service.Booking.VenueBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/venues/bookings")
public class VenueBookingController {
    private final VenueBookingService bookingService;

    @PreAuthorize("hasRole('venue_provider')")
    @GetMapping
    public List<Booking> getVenueBookings(){
        return bookingService.getAllBookings();
    }

    @PreAuthorize("hasRole('event_organizer')")
    @PostMapping
    public Booking createVenueBooking(@RequestBody Booking booking){
        return bookingService.createBooking(booking);
    }

    @PreAuthorize("hasRole('event_organizer')")
    @DeleteMapping("/{id}")
    public void cancelVenueBooking(@PathVariable Long id){
        bookingService.CancelBooking(id);
    }

}

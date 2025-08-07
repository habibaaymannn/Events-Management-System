package com.example.cdr.eventsmanagementsystem.Controller.Booking;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Service.Booking.ServiceBooking;
import com.example.cdr.eventsmanagementsystem.Service.Booking.VenueBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("v1/bookings/services")
public class ServiceBookingController {
    private final ServiceBooking bookingService;

    @PreAuthorize("hasRole('service_provider')")
    @GetMapping
    public List<Booking> getServiceBookings(){
        return bookingService.getAllBookings();
    }

    @PreAuthorize("hasRole('event_organizer')")
    @PostMapping("/service")
    public Booking createServiceBooking(@RequestBody Booking booking){
        return bookingService.createBooking(booking);
    }

    @PreAuthorize("hasRole('service_provider')")
    @DeleteMapping("/service/{id}")
    public void cancelServiceBooking(@PathVariable Long id){
        bookingService.CancelBooking(id);
    }
}

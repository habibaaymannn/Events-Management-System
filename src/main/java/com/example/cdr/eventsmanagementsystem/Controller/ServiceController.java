package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Service.Service.ServicesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/services")
@Tag(name = "Service", description = "Service provider APIs for managing services and bookings")
public class ServiceController {
    private final ServicesService servicesService;

    @Operation(summary = "Add a new service")
    @PreAuthorize("hasRole('service provider')")
    @PostMapping
    public ResponseEntity<ServicesDTO> addService(@Valid @RequestBody ServicesDTO dto) {
        ServicesDTO servicesDTO = servicesService.addService(dto);
        return ResponseEntity.ok(servicesDTO);
    }

    @Operation(summary = "Update availability of a service")
    @PreAuthorize("hasRole('service provider')")
    @PatchMapping("/{serviceId}/availability")
    public ResponseEntity<String> updateServiceAvailability(@PathVariable Long serviceId) throws AccessDeniedException {
        ServicesDTO updatedService =  servicesService.updateAvailability(serviceId);
        return ResponseEntity.ok("Service availability updated to " + updatedService.getAvailability());
    }


    @Operation(summary = "Get bookings for the current service provider")
    @PreAuthorize("hasRole('service provider')")
    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingDetailsResponse>> getBookings(Pageable pageable) {
        Page<BookingDetailsResponse> services = servicesService.getBookingsForServiceProvider(pageable);
        return ResponseEntity.ok(services);
    }

    @Operation(summary = "Accept or reject a booking request")
    @PreAuthorize("hasRole('service provider')")
    @PostMapping("/bookings/{bookingId}/status")
    public Booking acceptOrRejectBooking(@PathVariable Long bookingId,@RequestParam BookingStatus status) throws AccessDeniedException {
        return servicesService.respondToBookingRequests(bookingId, status);
    }
    @Operation(summary = "Cancel a booking as a service provider")
    @PreAuthorize("hasRole('service provider')")
    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) throws AccessDeniedException {
        servicesService.cancelBooking(bookingId);
        return ResponseEntity.ok().build();
    }
}
package com.example.cdr.eventsmanagementsystem.Controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Service.ServicesService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(ControllerConstants.SERVICE_BASE_URL)
@Tag(name = "Service", description = "Service provider APIs for managing services and bookings")
public class ServiceController {
    private final ServicesService servicesService;

    @Operation(summary = "Add a new service")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping
    public ResponseEntity<ServicesDTO> addService(@Valid @RequestBody ServicesDTO dto) {
        ServicesDTO servicesDTO = servicesService.addService(dto);
        return ResponseEntity.ok(servicesDTO);
    }

    @Operation(summary = "Update availability of a service")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PatchMapping("/{serviceId}/availability")
    public ResponseEntity<String> updateServiceAvailability(@PathVariable Long serviceId) {
        ServicesDTO updatedService =  servicesService.updateAvailability(serviceId);
        return ResponseEntity.ok("Service availability updated to " + updatedService.getAvailability());
    }


    @Operation(summary = "Get bookings for the current service provider")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingDetailsResponse>> getBookings(Pageable pageable) {
        Page<BookingDetailsResponse> services = servicesService.getBookingsForServiceProvider(pageable);
        return ResponseEntity.ok(services);
    }

    @Operation(summary = "Accept or reject a booking request")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping("/bookings/{bookingId}/status")
    public Booking acceptOrRejectBooking(@PathVariable Long bookingId,@RequestParam BookingStatus status)   {
        return servicesService.respondToBookingRequests(bookingId, status);
    }
    @Operation(summary = "Cancel a booking as a service provider")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId)  {
        servicesService.cancelBooking(bookingId);
        return ResponseEntity.ok().build();
    }
}
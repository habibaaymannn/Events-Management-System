package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.EventsControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.ServiceControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Service.ServicesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for service provider operations.
 * Provides endpoints to create services, update service availability,
 * retrieve service bookings, and respond to requests.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(ServiceControllerConstants.SERVICE_BASE_URL)
@Tag(name = "Service", description = "Service provider APIs for managing services and bookings")
public class ServiceController {
    private final ServicesService servicesService;

    @Operation(summary = "Create a new service", description = "Creates a new service for the service provider")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping(ServiceControllerConstants.CREATE_SERVICE_URL)
    public ResponseEntity<ServicesDTO> createService(@Valid @RequestBody ServicesDTO dto) {
        ServicesDTO servicesDTO = servicesService.addService(dto);
        return ResponseEntity.ok(servicesDTO);
    }

    @Operation(summary = "Update the availability of a service")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PatchMapping(ServiceControllerConstants.UPDATE_SERVICE_AVAILABILITY)
    public ResponseEntity<ServicesDTO> updateServiceAvailability(@PathVariable Long serviceId,@RequestParam String availability) {
        ServicesDTO updatedService =  servicesService.updateAvailability(serviceId, availability);
        return ResponseEntity.ok(updatedService);
    }
    @Operation(summary = "Get all services", description = "Retrieves a paginated list of all services")
    @GetMapping(ServiceControllerConstants.GET_ALL_SERVICES_URL)
    @PreAuthorize("hasAnyRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    public Page<ServicesDTO> getAllServices(@PageableDefault(page = 0, size = 10)Pageable pageable) {
        return servicesService.getAllServices(pageable);
    }

    @Operation(summary = "Get all booked services for a service provider", description = "Retrieves all service bookings associated with a specific service provider")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @GetMapping(ServiceControllerConstants.GET_SERVICE_BOOKINGS_URL)
    public ResponseEntity<Page<BookingDetailsResponse>> getServiceBookings(@PageableDefault(page = 0, size = 10)Pageable pageable) {
        Page<BookingDetailsResponse> services = servicesService.getBookingsForServiceProvider(pageable);
        return ResponseEntity.ok(services);
    }

    @Operation(summary = "Accept or reject a booking request")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping(ServiceControllerConstants.ACCEPT_OR_REJECT_SERVICE_BOOKING_URL)
    public Booking acceptOrRejectBooking(@PathVariable Long bookingId,@RequestParam BookingStatus status)   {
        return servicesService.respondToBookingRequests(bookingId, status);
    }

}
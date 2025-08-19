package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.Constants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ServiceControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Service.ServicesServiceInterface;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping(ServiceControllerConstants.SERVICE_BASE_URL)
@Tag(name = "Service", description = "Service provider APIs for managing services and bookings")
public class ServiceController {
    private final ServicesServiceInterface servicesService;

    @Operation(summary = "Add a new service")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping(ServiceControllerConstants.CREATE_SERVICE_URL)
    public ResponseEntity<ServicesDTO> addService(@Valid @RequestBody ServicesDTO dto) {
        ServicesDTO servicesDTO = servicesService.addService(dto);
        return ResponseEntity.ok(servicesDTO);
    }

    @Operation(summary = "Update availability of a service")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PatchMapping(ServiceControllerConstants.UPDATE_SERVICE_AVAILABILITY)
    public ResponseEntity<String> updateServiceAvailability(@PathVariable Long serviceId) {
        ServicesDTO updatedService =  servicesService.updateAvailability(serviceId);
        return ResponseEntity.ok("Service availability updated to " + updatedService.getAvailability());
    }


    @Operation(summary = "Get bookings for the current service provider")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @GetMapping(ServiceControllerConstants.GET_SERVICE_BOOKINGS_URL)
    public ResponseEntity<Page<BookingDetailsResponse>> getBookings(Pageable pageable) {
        Page<BookingDetailsResponse> services = servicesService.getBookingsForServiceProvider(pageable);
        return ResponseEntity.ok(services);
    }

    @Operation(summary = "Accept or reject a booking request")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping(ServiceControllerConstants.ACCEPT_OR_REJECT_SERVICE_BOOKING_URL)
    public Booking acceptOrRejectBooking(@PathVariable Long bookingId,@RequestParam BookingStatus status)   {
        return servicesService.respondToBookingRequests(bookingId, status);
    }
    @Operation(summary = "Cancel a booking as a service provider")
    @PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
    @PostMapping(ServiceControllerConstants.CANCEL_SERVICE_BOOKING_URL)
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId)  {
        servicesService.cancelBooking(bookingId);
        return ResponseEntity.ok().build();
    }
}
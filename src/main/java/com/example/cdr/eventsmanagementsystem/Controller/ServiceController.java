package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Service.Service.ServicesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/services")
public class ServiceController {
    private final ServicesService servicesService;

    @PreAuthorize("hasRole('service_provider')")
    @PostMapping
    public Services addService(@RequestBody Services service) {
        return servicesService.addService(service);
    }

    @PreAuthorize("hasRole('service_provider')")
    @PatchMapping("/{serviceId}/availability")
    public ResponseEntity<String> updateServiceAvailability(@PathVariable Long serviceId) throws AccessDeniedException {
        Services updatedService =  servicesService.updateAvailability(serviceId);
        return ResponseEntity.ok("Service availability updated to " + updatedService.getAvailability());
    }
}

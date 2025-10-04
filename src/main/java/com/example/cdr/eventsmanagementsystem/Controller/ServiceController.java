package com.example.cdr.eventsmanagementsystem.Controller;

import java.io.IOException;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.ServiceControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Service.Service.ServicesService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants.*;

/**
 * REST controller for service provider operations.
 * Provides endpoints to create services, update service availability,
 * retrieve service bookings, and respond to requests.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(ServiceControllerConstants.SERVICE_BASE_URL)
@PreAuthorize("hasRole('" + RoleConstants.SERVICE_PROVIDER_ROLE + "')")
@Tag(name = "Service", description = "Service provider APIs for managing services")
public class ServiceController {
    private final ServicesService servicesService;

    @Operation(summary = "Get service by ID", description = "Retrieves service details by its ID")
    @GetMapping(ServiceControllerConstants.GET_SERVICE_BY_ID_URL)
    public ServicesDTO getServiceById(@PathVariable Long id) {
        return servicesService.getServiceById(id);
    }

    @Operation(summary = "Get services by service provider", description = "Return all services related to a service provider")
    @GetMapping(ServiceControllerConstants.GET_SERVICES_BY_PROVIDER_URL)
    public Page<ServicesDTO> getServicesByServiceProvider(@ParameterObject @PageableDefault() Pageable pageable) {
        return servicesService.getServicesByServiceProvider(pageable);
    }

    @Operation(summary = "Get all services", description = "Retrieves a paginated list of all services")
    @GetMapping(ServiceControllerConstants.GET_ALL_SERVICES_URL)
    @PreAuthorize("hasAnyRole('" + ORGANIZER_ROLE + "','" + ADMIN_ROLE + "')")
    public Page<ServicesDTO> getAllServices(@ParameterObject @PageableDefault() Pageable pageable) {
        return servicesService.getAllServices(pageable);
    }

    @Operation(summary = "Create a new service", description = "Creates a new service for the service provider")
    @PostMapping(path = ServiceControllerConstants.CREATE_SERVICE_URL, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ServicesDTO> createService(@Valid @RequestBody ServicesDTO dto, @RequestPart(value = "images", required = false) List<MultipartFile> imgFiles) throws IOException{
        ServicesDTO servicesDTO = servicesService.addService(dto, imgFiles);
        return ResponseEntity.ok(servicesDTO);
    }

    @Operation(summary = "Update an existing service", description = "Updates the details of a service by ID")
    @PutMapping(ServiceControllerConstants.UPDATE_SERVICE_URL)
    public ResponseEntity<ServicesDTO> updateService(@PathVariable Long serviceId, @Valid @RequestBody ServicesDTO dto, @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages) throws IOException {
        ServicesDTO updatedService = servicesService.updateService(serviceId, dto, newImages);
        return ResponseEntity.ok(updatedService);
    }

    @Operation(summary = "Delete a service", description = "Deletes a service by its ID")
    @DeleteMapping(ServiceControllerConstants.DELETE_SERVICE_URL)
    public ResponseEntity<Void> deleteService(@PathVariable Long serviceId) {
        servicesService.deleteService(serviceId);
        return ResponseEntity.noContent().build();
    }
}
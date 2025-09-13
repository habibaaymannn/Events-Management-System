package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Service.User.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for admin event management.
 * Provides endpoints to retrieve all events, filter events by status,
 * and cancel events.
 */

@RestController
@RequiredArgsConstructor
@RequestMapping(AdminControllerConstants.ADMIN_BASE_URL)
@PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
@Tag(name = "Admin - Events", description = "Admin event management APIs")
public class AdminEventController {
    private final AdminService adminService;

    @Operation(summary = "Get all events", description = "Retrieves all events with pagination")
    @GetMapping(AdminControllerConstants.ADMIN_EVENTS_URL)
    public Page<EventDetailsDto> getAllEvents(@ParameterObject @PageableDefault() Pageable pageable) {
        return adminService.getAllEvents(pageable);
    }

    @Operation(summary = "Get events by status", description = "Retrieves events by their status with pagination")
    @GetMapping(AdminControllerConstants.ADMIN_EVENTS_BY_STATUS_URL)
    public Page<EventDetailsDto> getEventsByStatus(@RequestParam EventStatus status, @ParameterObject @PageableDefault() Pageable pageable) {
        return adminService.getEventsByStatus(status, pageable);
    }

    @Operation(summary = "Cancel an event", description = "Cancels an existing event")
    @PostMapping(AdminControllerConstants.ADMIN_EVENT_CANCEL_URL)
    public void cancelEvent(@PathVariable Long eventId) {
        adminService.cancelEvent(eventId);
    }

     // CHANGE: Added flag endpoints because your frontend calls:
    // POST /v1/admin/events/{eventId}/flag?reason=...
    // GET  /v1/admin/events/flagged
    // We expose them here and delegate to AdminService.
    @Operation(summary = "Flag an event", description = "Flags an event for admin review")
    @PostMapping(AdminControllerConstants.ADMIN_EVENT_FLAG_URL)
    public void flagEvent(@PathVariable Long eventId, @RequestParam String reason) {
        adminService.flagEvent(eventId, reason);
    }

    @Operation(summary = "Get flagged events", description = "Retrieves all flagged events with pagination")
    @GetMapping(AdminControllerConstants.ADMIN_EVENTS_FLAGGED_URL)
    public Page<EventDetailsDto> getFlaggedEvents(
            @ParameterObject @PageableDefault Pageable pageable) {
        return adminService.getFlaggedEvents(pageable);
    }
}

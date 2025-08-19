package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Service.User.AdminServiceInterface;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin - Events", description = "Admin event management APIs")
public class AdminEventController extends AdminController {
    private final AdminServiceInterface adminService;

    @Operation(summary = "Get all events", description = "Retrieves all events with pagination")
    @GetMapping(AdminControllerConstants.ADMIN_EVENTS_URL)
    public Page<EventDetailsDto> getAllEvents(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getAllEvents(pageable);
    }

    @Operation(summary = "Get events by status", description = "Retrieves events by their status with pagination")
    @GetMapping(AdminControllerConstants.ADMIN_EVENTS_BY_STATUS_URL)
    public Page<EventDetailsDto> getEventsByStatus(@RequestParam EventStatus status,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getEventsByStatus(status, pageable);
    }

    @Operation(summary = "Cancel an event", description = "Cancels an existing event")
    @PostMapping(AdminControllerConstants.ADMIN_EVENT_CANCEL_URL)
    public void cancelEvent(@PathVariable Long eventId) {
        adminService.cancelEvent(eventId);
    }
}

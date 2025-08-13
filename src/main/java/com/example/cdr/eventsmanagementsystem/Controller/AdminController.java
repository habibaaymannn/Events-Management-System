package com.example.cdr.eventsmanagementsystem.Controller;

import java.time.LocalDate;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserCreateDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Service.User.IAdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin")
@PreAuthorize("hasRole('admin')")
@RequiredArgsConstructor
@Tag(name="Admin" , description = "Admin management APIs")
public class AdminController {

    private final IAdminService adminService;

    @Operation(summary = "Get all users", description = "Retrieves all users with pagination")
    @GetMapping("/users")
    public Page<UserDetailsDto> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getAllUsers(pageable);
    }

    @Operation(summary = "Create a new user", description = "Creates a new user with the provided details")
    @PostMapping("/users")
    public UserDetailsDto createUser(@RequestBody UserCreateDto dto) {
        return adminService.createUser(dto);
    }

    @Operation(summary = "Update user role", description = "Updates the role of an existing user")
    @PutMapping("/users/{userId}/role")
    public UserDetailsDto updateUserRole(@PathVariable String userId, @RequestParam String role) {
        return adminService.updateUserRole(userId, role);
    }

    @Operation(summary = "Deactivate user", description = "Deactivates an existing user")
    @PostMapping("/users/{userId}/deactivate")
    public void deactivateUser(@PathVariable String userId) {
        adminService.deactivateUser(userId);
    }

    @Operation(summary = "Get all events", description = "Retrieves all events with pagination")
    @GetMapping("/events")
    public Page<EventDetailsDto> getAllEvents(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getAllEvents(pageable);
    }

    @Operation(summary = "Get events by status", description = "Retrieves events by their status with pagination")
    @GetMapping("/events/by-status")
    public Page<EventDetailsDto> getEventsByStatus(@RequestParam EventStatus status,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getEventsByStatus(status, pageable);
    }

    @Operation(summary = "Get flagged events", description = "Retrieves flagged events with pagination")
    @GetMapping("/events/flagged")
    public Page<EventDetailsDto> getFlaggedEvents(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getFlaggedEvents(pageable);
    }

    @Operation(summary = "Cancel an event", description = "Cancels an existing event")
    @PostMapping("/events/{eventId}/cancel")
    public void cancelEvent(@PathVariable Long eventId) {
        adminService.cancelEvent(eventId);
    }

    @Operation(summary = "Flag an event", description = "Flags an existing event with a reason")
    @PostMapping("/events/{eventId}/flag")
    public void flagEvent(@PathVariable Long eventId, @RequestParam String reason) {
        adminService.flagEvent(eventId, reason);
    }

    @Operation(summary = "Get dashboard statistics", description = "Retrieves statistics for the dashboard")
    @GetMapping("/dashboard")
    public DashboardStatisticsDto getDashboard() {
        return adminService.getDashboardStatistics();
    }

    @Operation(summary = "Get event type distribution", description = "Retrieves the distribution of events by type")
    @GetMapping("/event-type-distribution")
    public Map<String, Long> getEventTypeDistribution() {
        return adminService.getEventTypeDistribution();
    }

    @Operation(summary = "Get daily bookings", description = "Retrieves the number of bookings per day")
    @GetMapping("/daily-bookings")
    public Map<LocalDate, Long> getDailyBookings(@RequestParam LocalDate start,
                                                 @RequestParam LocalDate end) {
        return adminService.getDailyBookingCount(start, end);
    }

    @Operation(summary = "Get daily cancellations", description = "Retrieves the number of cancellations per day")
    @GetMapping("/daily-cancellations")
    public Map<LocalDate, Long> getDailyCancellations(@RequestParam LocalDate start,
                                                      @RequestParam LocalDate end) {
        return adminService.getDailyCancellationCount(start, end);
    }

    
}



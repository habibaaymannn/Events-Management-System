package com.example.cdr.eventsmanagementsystem.Controller;

import java.time.LocalDate;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin")
// @PreAuthorize("hasRole('admin')")
@RequiredArgsConstructor
public class AdminController {

    private final IAdminService adminService;

    @GetMapping("/users")
    public Page<UserDetailsDto> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getAllUsers(pageable);
    }

    @PostMapping("/users")
    public UserDetailsDto createUser(@RequestBody UserCreateDto dto) {
        return adminService.createUser(dto);
    }

    @PutMapping("/users/{userId}/role")
    public UserDetailsDto updateUserRole(@PathVariable String userId, @RequestParam String role) {
        return adminService.updateUserRole(userId, role);
    }

    @PostMapping("/users/{userId}/deactivate")
    public void deactivateUser(@PathVariable String userId) {
        adminService.deactivateUser(userId);
    }

    @GetMapping("/events")
    public Page<EventDetailsDto> getAllEvents(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getAllEvents(pageable);
    }

    @GetMapping("/events/by-status")
    public Page<EventDetailsDto> getEventsByStatus(@RequestParam EventStatus status,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getEventsByStatus(status, pageable);
    }

    @GetMapping("/events/flagged")
    public Page<EventDetailsDto> getFlaggedEvents(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminService.getFlaggedEvents(pageable);
    }

    @PostMapping("/events/{eventId}/cancel")
    public void cancelEvent(@PathVariable Long eventId) {
        adminService.cancelEvent(eventId);
    }

    @PostMapping("/events/{eventId}/flag")
    public void flagEvent(@PathVariable Long eventId, @RequestParam String reason) {
        adminService.flagEvent(eventId, reason);
    }

    @GetMapping("/dashboard")
    public DashboardStatisticsDto getDashboard() {
        return adminService.getDashboardStatistics();
    }

    @GetMapping("/event-type-distribution")
    public Map<String, Long> getEventTypeDistribution() {
        return adminService.getEventTypeDistribution();
    }

    @GetMapping("/daily-bookings")
    public Map<LocalDate, Long> getDailyBookings(@RequestParam LocalDate start,
                                                 @RequestParam LocalDate end) {
        return adminService.getDailyBookingCount(start, end);
    }

    @GetMapping("/daily-cancellations")
    public Map<LocalDate, Long> getDailyCancellations(@RequestParam LocalDate start,
                                                      @RequestParam LocalDate end) {
        return adminService.getDailyCancellationCount(start, end);
    }

    
}



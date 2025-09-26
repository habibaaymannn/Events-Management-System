package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.Keycloak.KeycloakAdminService;
import com.example.cdr.eventsmanagementsystem.Service.User.AdminService;
import com.example.cdr.eventsmanagementsystem.Service.User.StatisticsManagement;
import com.example.cdr.eventsmanagementsystem.Mapper.AdminDashboardMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping(AdminControllerConstants.ADMIN_BASE_URL)
@PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
@Tag(name = "Admin - Dashboard", description = "Admin dashboard & statistics APIs")
public class AdminDashboardController {

    private final AdminService adminService;
    private final KeycloakAdminService keycloakAdminService;
    private final StatisticsManagement statistics;
    private final AdminDashboardMapper adminDashboardMapper;

    @Operation(summary = "Get dashboard statistics", description = "Retrieves statistics for the dashboard")
    @GetMapping(AdminControllerConstants.ADMIN_DASHBOARD_URL)
    public ResponseEntity<DashboardStatisticsDto> dashboard() {
        // Start with DB-derived stats (totals, utilization, revenue)
        DashboardStatisticsDto dto = statistics.getDashboardStatistics();
        // Overwrite the user counts with Keycloak (if you prefer KC as source of truth)
        Map<String, Long> roleCounts = keycloakAdminService.countUsersByRole();
        adminDashboardMapper.applyUserRoleCounts(dto, roleCounts);

        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Get event type distribution", description = "Retrieves the distribution of events by type")
    @GetMapping(AdminControllerConstants.ADMIN_EVENT_TYPE_DISTRIBUTION_URL)
    public Map<String, Long> getEventTypeDistribution() {
        return adminService.getEventTypeDistribution();
    }

    @Operation(summary = "Get daily bookings", description = "Retrieves the number of bookings per day")
    @GetMapping(AdminControllerConstants.ADMIN_DAILY_BOOKINGS_URL)
    public Map<LocalDate, Long> getDailyBookings(@RequestParam LocalDate start,
                                                 @RequestParam LocalDate end) {
        return adminService.getDailyBookingCount(start, end);
    }

    @Operation(summary = "Get daily cancellations", description = "Retrieves the number of cancellations per day")
    @GetMapping(AdminControllerConstants.ADMIN_DAILY_CANCELLATIONS_URL)
    public Map<LocalDate, Long> getDailyCancellations(@RequestParam LocalDate start,
                                                      @RequestParam LocalDate end) {
        return adminService.getDailyCancellationCount(start, end);
    }

    @GetMapping("/daily-bookings-breakdown")
    public ResponseEntity<Map<String, Long>> dailyBookingsBreakdown(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(statistics.dailyBookingsBreakdown(date));
    }

    @GetMapping("/daily-cancellations-breakdown")
    public ResponseEntity<Map<String, Long>> dailyCancellationsBreakdown(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(statistics.dailyCancellationsBreakdown(date));
    }

}

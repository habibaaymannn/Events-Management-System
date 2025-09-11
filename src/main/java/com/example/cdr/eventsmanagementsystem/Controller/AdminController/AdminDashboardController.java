package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.Service.User.AdminService;
import com.example.cdr.eventsmanagementsystem.keycloak.KeycloakAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.Map;
/**

 * REST controller for admin dashboard operations.
 * Provides endpoints to retrieve dashboard statistics, event type distribution,
 * daily bookings, and daily cancellations.
 */
import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin - Dashboard", description = "Admin dashboard & statistics APIs")
public class AdminDashboardController extends AdminController {
    private final AdminService adminService;
    private final KeycloakAdminService keycloakAdminService;

    @Operation(summary = "Get dashboard statistics", description = "Retrieves statistics for the dashboard")
    @GetMapping(AdminControllerConstants.ADMIN_DASHBOARD_URL)
    public ResponseEntity<DashboardStatisticsDto> dashboard() {
    DashboardStatisticsDto dto = new DashboardStatisticsDto();

        // ---- USERS (from Keycloak) ----
        Map<String, Long> c = keycloakAdminService.countUsersByRole();
        dto.setNumAdmins(c.getOrDefault("admins", 0L));
        dto.setNumOrganizers(c.getOrDefault("organizers", 0L));
        dto.setNumAttendees(c.getOrDefault("attendees", 0L));
        dto.setNumServiceProviders(c.getOrDefault("service_providers", 0L));
        dto.setNumVenueProviders(c.getOrDefault("venue_providers", 0L));

        // ---- EVENTS (keep your existing queries if any) ----
        // dto.setTotalUpcoming(...);
        // dto.setTotalOngoing(...);
        // dto.setTotalCompleted(...);
        // dto.setTotalCancelled(...);

        // dto.setVenueUtilizationRate(...);
        // dto.setServiceProviderUtilizationRate(...);

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
}

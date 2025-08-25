package com.example.cdr.eventsmanagementsystem.Controller.AdminController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.AdminControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.Service.User.AdminServiceInterface;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin - Dashboard", description = "Admin dashboard & statistics APIs")
public class AdminDashboardController extends AdminController {
    private final AdminServiceInterface adminService;

    @Operation(summary = "Get dashboard statistics", description = "Retrieves statistics for the dashboard")
    @GetMapping(AdminControllerConstants.ADMIN_DASHBOARD_URL)
    public DashboardStatisticsDto getDashboard() {
        return adminService.getDashboardStatistics();
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

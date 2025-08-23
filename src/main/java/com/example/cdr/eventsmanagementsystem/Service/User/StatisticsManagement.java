package com.example.cdr.eventsmanagementsystem.Service.User;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.OrganizerRevenueDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.Map;

/**
 * Interface for retrieving various administrative statistics
 * related to events, bookings, and utilization.
 */

public interface StatisticsManagement {
    DashboardStatisticsDto getDashboardStatistics();
    Map<String, Long> getEventTypeDistribution();
    Map<LocalDate, Long> getDailyBookingCount(LocalDate startDate, LocalDate endDate);
    Map<LocalDate, Long> getDailyCancellationCount(LocalDate startDate, LocalDate endDate);
    Page<OrganizerRevenueDto> getRevenuePerOrganizer(LocalDate startDate, LocalDate endDate, Pageable pageable);
    double getVenueUtilizationRate();
    double getServiceProviderUtilizationRate();
}

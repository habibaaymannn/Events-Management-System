package com.example.eventsmanagementsystem.Service.User;

import java.time.LocalDate;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.eventsmanagementsystem.DTO.Admin.OrganizerRevenueDto;
import com.example.eventsmanagementsystem.Model.Event.EventStatus;
import lombok.RequiredArgsConstructor;

/**
 * Service providing administrative operations for users, events, and statistics.
 */

@Service
@Transactional
@RequiredArgsConstructor
public class AdminService {
    private final AdminEventManagement eventManagement;
    private final StatisticsManagement statisticsManagement;

    public Page<EventDetailsDto> getAllEvents(Pageable pageable) {
        return eventManagement.getAllEvents(pageable);
    }

    public Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable) {
        return eventManagement.getEventsByStatus(status, pageable);
    }

    public void cancelEvent(Long eventId) {
        eventManagement.cancelEvent(eventId);
    }

    public DashboardStatisticsDto getDashboardStatistics() {
        return statisticsManagement.getDashboardStatistics();
    }

    public Map<String, Long> getEventTypeDistribution() {
        return statisticsManagement.getEventTypeDistribution();
    }

    public Map<LocalDate, Long> getDailyBookingCount(LocalDate startDate, LocalDate endDate) {
        return statisticsManagement.getDailyBookingCount(startDate, endDate);
    }

    public Map<LocalDate, Long> getDailyCancellationCount(LocalDate startDate, LocalDate endDate) {
        return statisticsManagement.getDailyCancellationCount(startDate, endDate);
    }

    public Page<OrganizerRevenueDto> getRevenuePerOrganizer(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return statisticsManagement.getRevenuePerOrganizer(startDate, endDate, pageable);
    }

    public double getVenueUtilizationRate() {
        return statisticsManagement.getVenueUtilizationRate();
    }

    public double getServiceProviderUtilizationRate() {
        return statisticsManagement.getServiceProviderUtilizationRate();
    }
}
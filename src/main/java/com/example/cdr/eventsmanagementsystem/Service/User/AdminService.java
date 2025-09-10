package com.example.cdr.eventsmanagementsystem.Service.User;

import java.time.LocalDate;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.OrganizerRevenueDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserCreateDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
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

    public void flagEvent(Long eventId, String reason) {
        eventManagement.flagEvent(eventId, reason);
    }

    public Page<EventDetailsDto> getFlaggedEvents(Pageable pageable) {
        return eventManagement.getFlaggedEvents(pageable);
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
package com.example.cdr.eventsmanagementsystem.Service.User;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.*;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Map;

/**
 * Composite interface for admin operations.
 * Combines user management, event management, and statistical reporting
 * functionalities for admin purposes.
 */

public interface AdminServiceInterface {
    Page<EventDetailsDto> getAllEvents(Pageable pageable);
    Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable);


    void cancelEvent(Long eventId);
    Page<UserDetailsDto> getAllUsers(Pageable pageable);
    UserDetailsDto createUser(UserCreateDto userCreateDto);
    UserDetailsDto updateUserRole(String userId, String role);
    void deactivateUser(String userId);
    void resetPassword(String userId);


    DashboardStatisticsDto getDashboardStatistics();
    Map<String, Long> getEventTypeDistribution();
    Map<LocalDate, Long> getDailyBookingCount(LocalDate startDate, LocalDate endDate);
    Map<LocalDate, Long> getDailyCancellationCount(LocalDate startDate, LocalDate endDate);
    Page<OrganizerRevenueDto> getRevenuePerOrganizer(LocalDate startDate, LocalDate endDate, Pageable pageable);
    double getVenueUtilizationRate();
    double getServiceProviderUtilizationRate();
}
package com.example.cdr.eventsmanagementsystem.Service.User;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.OrganizerRevenueDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserCreateDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;

public interface AdminServiceInterface {
    Page<UserDetailsDto> getAllUsers(Pageable pageable);
    UserDetailsDto createUser(UserCreateDto userCreateDto);
    UserDetailsDto updateUserRole(String userId, String role);
    void deactivateUser(String userId);
    void resetPassword(String userId);

    Page<EventDetailsDto> getAllEvents(Pageable pageable);
    Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable);
//    Page<EventDetailsDto> getFlaggedEvents(Pageable pageable);
    void cancelEvent(Long eventId);
//    void flagEvent(Long eventId, String reason);

    DashboardStatisticsDto getDashboardStatistics();
    Map<String, Long> getEventTypeDistribution();
    Map<LocalDate, Long> getDailyBookingCount(LocalDate startDate, LocalDate endDate);
    Map<LocalDate, Long> getDailyCancellationCount(LocalDate startDate, LocalDate endDate);
    Page<OrganizerRevenueDto> getRevenuePerOrganizer(LocalDate startDate, LocalDate endDate, Pageable pageable);

    double getVenueUtilizationRate();
    double getServiceProviderUtilizationRate();
}
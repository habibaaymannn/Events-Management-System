package com.example.cdr.eventsmanagementsystem.Mapper;
import java.util.Map;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import org.springframework.stereotype.Component;

@Component
public class AdminDashboardMapper {

    public void applyUserRoleCounts(DashboardStatisticsDto dto, Map<String, Long> roleCounts) {
        dto.setNumAdmins(roleCounts.getOrDefault("admins", 0L));
        dto.setNumOrganizers(roleCounts.getOrDefault("organizers", 0L));
        dto.setNumAttendees(roleCounts.getOrDefault("attendees", 0L));
        dto.setNumServiceProviders(roleCounts.getOrDefault("service_providers", 0L));
        dto.setNumVenueProviders(roleCounts.getOrDefault("venue_providers", 0L));
    }
}
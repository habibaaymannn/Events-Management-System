package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import lombok.Data;
import java.util.List;

@Data
public class DashboardStatisticsDto {
    private long totalUpcoming;
    private long totalOngoing;
    private long totalCompleted;
    private long totalCancelled;

    private long numAdmins;
    private long numOrganizers;
    private long numAttendees;
    private long numServiceProviders;
    private long numVenueProviders;

    private double venueUtilizationRate;
    private double serviceProviderUtilizationRate;
    private List<UiRevenue> revenueByOrganizer;

    private long venueActiveNow;
    private long venueTotal;
    private long serviceProvidersActiveNow;
    private long serviceProvidersTotal;
}



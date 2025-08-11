package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import lombok.Data;

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
}



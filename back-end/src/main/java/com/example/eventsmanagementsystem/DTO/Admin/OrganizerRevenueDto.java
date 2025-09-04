package com.example.eventsmanagementsystem.DTO.Admin;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class OrganizerRevenueDto {
    private String organizerId;
    private String organizerName;
    private BigDecimal totalRevenue;
}



package com.example.cdr.eventsmanagementsystem.DTO.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

import lombok.Data;

@Data
public class UpdateEventDTO {
    private Long id;

    private String name;

    private String description;

    private EventType type;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long venueId;

    private List<Long> serviceProviderIds;

    private BigDecimal retailPrice;
}

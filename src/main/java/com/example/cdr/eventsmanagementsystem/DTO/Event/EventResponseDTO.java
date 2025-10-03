package com.example.cdr.eventsmanagementsystem.DTO.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

import lombok.Data;

@Data
public class EventResponseDTO {
    private Long id;
    private String name;
    private String description;
    private EventType type;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private String organizerId;
    private String organizerName;
    private Long venueId;
    private String venueName;
    private String venueLocation;
    private List<Long> serviceProviderIds;
    private List<String> serviceProviderNames;
    private BigDecimal retailPrice;
    private LocalDateTime freeCancellationDeadline;
}

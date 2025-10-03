package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import java.time.LocalDateTime;

import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

import lombok.Data;

@Data
public class EventDetailsDto {
    private Long id;
    private String name;
    private EventType type;
    private double retailPrice;
    private EventStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String organizerId;
    private String organizerName;
    private Long venueId;
    private String venueName;
    private String venueLocation;
    private boolean flagged;
    private String flagReason;
}



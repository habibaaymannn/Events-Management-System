package com.example.cdr.eventsmanagementsystem.DTO.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

import lombok.Data;

@Data
public class EventUpdateDTO {
    // private Long id;

    private String name;

    private String description;

    private EventType type;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal retailPrice;

    private Long venueId;
}

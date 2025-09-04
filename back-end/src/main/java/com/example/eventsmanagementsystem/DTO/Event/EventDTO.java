package com.example.eventsmanagementsystem.DTO.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.eventsmanagementsystem.Model.Event.EventType;

import lombok.Data;

@Data
public class EventDTO {
    private String name;
    private String description;
    private EventType type;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal retailPrice;
    private LocalDateTime freeCancellationDeadline;
    
    private String organizerId;
}

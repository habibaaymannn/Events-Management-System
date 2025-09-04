package com.example.eventsmanagementsystem.DTO.projections;

import com.example.eventsmanagementsystem.Model.Event.EventType;

public interface EventTypeCount {
    EventType getType();
    Long getCount();
}



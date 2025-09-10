package com.example.cdr.eventsmanagementsystem.DTO.projections;

import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

public interface EventTypeCount {
    EventType getType();
    Long getCount();
}



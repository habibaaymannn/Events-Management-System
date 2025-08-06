package com.example.cdr.eventsmanagementsystem.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;

@Mapper(componentModel = "spring")
public interface EventMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    Event toEvent(EventDTO dto);
    
    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(target = "serviceProviderIds", ignore = true)
    EventDTO toEventDTO(Event event);
}

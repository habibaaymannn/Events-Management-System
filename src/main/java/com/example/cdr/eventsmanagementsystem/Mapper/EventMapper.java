package com.example.cdr.eventsmanagementsystem.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.UpdateEventDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;

@Mapper(componentModel = "spring")
public interface EventMapper {
    // Create Event from EventDTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "admin", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    Event toEvent(EventDTO dto);

    // Update Event from UpdateEventDTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "admin", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    void updateEventFromDTO(UpdateEventDTO dto, @MappingTarget Event event);

    // Event to EventDTO
    @Mapping(source = "organizer.id", target = "organizerId")
    EventDTO toEventDTO(Event event);

    // Event to UpdateEventDTO
    UpdateEventDTO toUpdateEventDTO(Event event);

    // Event to EventResponseDTO
    @Mapping(source = "organizer.id", target = "organizerId")
    @Mapping(source = "organizer", target = "organizerName", qualifiedByName = "getOrganizerName")
    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "venue", target = "venueName", qualifiedByName = "getVenueName")
    @Mapping(target = "serviceProviderIds", ignore = true) // Will be handled later
    @Mapping(target = "serviceProviderNames", ignore = true) // Will be handled later
    EventResponseDTO toEventResponseDTO(Event event);

    @Named("getOrganizerName")
    default String getOrganizerName(Organizer organizer) {
        if (organizer == null) return null;
        return organizer.getFirstName() + " " + organizer.getLastName();
    }

    @Named("getVenueName")
    default String getVenueName(Venue venue) {
        if (venue == null) return null;
        return venue.getName();
    }
}

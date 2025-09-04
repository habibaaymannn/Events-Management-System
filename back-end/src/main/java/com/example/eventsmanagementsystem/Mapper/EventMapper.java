package com.example.eventsmanagementsystem.Mapper;

import java.time.LocalDateTime;

import com.example.eventsmanagementsystem.DTO.Event.EventUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.example.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.eventsmanagementsystem.Model.Event.Event;
import com.example.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.eventsmanagementsystem.Model.User.Organizer;
import com.example.eventsmanagementsystem.Model.Venue.Venue;

@Mapper(componentModel = "spring")
public interface EventMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "admin", ignore = true)
    @Mapping(target = "status", ignore = true)
    Event toEvent(EventDTO dto);

    default Event toEventWithDefaults(EventDTO dto, Organizer organizer) {
        Event event = toEvent(dto);
        
        if (organizer != null) {
            event.setOrganizer(organizer);
        }

        if (event.getStatus() == null) {
            event.setStatus(EventStatus.DRAFT);
        }

        if (event.getStartTime() == null) {
            event.setStartTime(LocalDateTime.now());
        }
        if (event.getEndTime() == null) {
            event.setEndTime(event.getStartTime().plusHours(1));
        }

            // free cancellation default
        if (event.getFreeCancellationDeadline() == null) {
            event.setFreeCancellationDeadline(LocalDateTime.now().plusDays(1));
        }
        return event;
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "venue", ignore = true)
    @Mapping(target = "admin", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "freeCancellationDeadline", ignore = true)
    void updateEventFromDTO(EventUpdateDTO dto, @MappingTarget Event event);

    @Mapping(source = "organizer.id", target = "organizerId")
    EventDTO toEventDTO(Event event);

    EventUpdateDTO toUpdateEventDTO(Event event);

    @Mapping(source = "organizer.id", target = "organizerId")
    @Mapping(source = "organizer", target = "organizerName", qualifiedByName = "getOrganizerName")
    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "venue", target = "venueName", qualifiedByName = "getVenueName")
    @Mapping(target = "serviceProviderIds", ignore = true)
    @Mapping(target = "serviceProviderNames", ignore = true)
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

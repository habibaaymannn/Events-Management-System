package com.example.cdr.eventsmanagementsystem.Mapper;

import java.time.LocalDateTime;
import java.util.Objects;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventUpdateDTO;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.mapstruct.*;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;

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
    @Mapping(target = "venue", source = "venueId", qualifiedByName = "venueIdToVenue")
    @Mapping(target = "admin", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "freeCancellationDeadline", ignore = true)
    void updateEventFromDTO(EventUpdateDTO dto, @MappingTarget Event event, @Context VenueRepository venueRepository);

    @Mapping(source = "organizer.id", target = "organizerId")
    EventDTO toEventDTO(Event event);

    EventUpdateDTO toUpdateEventDTO(Event event);

    @Mapping(source = "organizer.id", target = "organizerId")
    @Mapping(source = "organizer", target = "organizerName", qualifiedByName = "getOrganizerName")
    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "venue", target = "venueName", qualifiedByName = "getVenueName")
    @Mapping(source = "venue.location", target = "venueLocation")
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

    @Named("venueIdToVenue")
    default Venue venueIdToVenue(Long venueId, @Context VenueRepository venueRepository) {
        if (Objects.isNull(venueId)) return null;
        return venueRepository.findById(venueId).orElseThrow(() -> new EntityNotFoundException("Venue not found"));
    }
}

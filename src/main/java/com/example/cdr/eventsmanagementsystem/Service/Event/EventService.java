package com.example.cdr.eventsmanagementsystem.Service.Event;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import static com.example.cdr.eventsmanagementsystem.Constants.ExceptionConstants.EVENT_NOT_FOUND;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventUpdateDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.AdminMapper;
import com.example.cdr.eventsmanagementsystem.Mapper.EventMapper;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * Service class for managing events.
 * Provides functionality to create, retrieve, update, delete, and list events,
 * as well as retrieve events by type.
 */

@RequiredArgsConstructor
@Service
public class EventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final UserSyncService userSyncService;
    private final AdminMapper adminMapper;


    public EventResponseDTO createEvent(EventDTO eventDTO) {
        Organizer organizer = ensureCurrentUserAsOrganizer();
        Event event = eventMapper.toEventWithDefaults(eventDTO, organizer);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toEventResponseDTO(savedEvent);
    }

    private Organizer ensureCurrentUserAsOrganizer() {
        return userSyncService.ensureUserExists(Organizer.class);
    }

    public EventResponseDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));
        return eventMapper.toEventResponseDTO(event);
    }

    public EventResponseDTO updateEvent(Long eventId, EventUpdateDTO updateDTO) {
        Event existingEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));

        eventMapper.updateEventFromDTO(updateDTO, existingEvent);

        Event savedEvent = eventRepository.save(existingEvent);
        return eventMapper.toEventResponseDTO(savedEvent);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException(EVENT_NOT_FOUND);
        }
        eventRepository.deleteById(id);
    }

    public List<EventResponseDTO> getEventsByType(EventType type) {
        List<Event> events = eventRepository.findByType(type);
        return events.stream().map(eventMapper::toEventResponseDTO).toList();
    }

    public Page<EventResponseDTO> getEventsByOrganizer(Pageable pageable) {
        Organizer organizer = ensureCurrentUserAsOrganizer();
        Page<Event> eventPage = eventRepository.findByOrganizer(organizer, pageable);
        return eventPage.map(eventMapper::toEventResponseDTO);
    }

    public void cancelEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    /*
     * We used EventDetailsDto here as it's more comprehensive for admin views
     * compared to EventResponseDTO which is more user-focused.
     */
    public Page<EventDetailsDto> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable).map(adminMapper::toEventDetailsDto);
    }

    public Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable) {
        return eventRepository.findByStatus(status, pageable).map(adminMapper::toEventDetailsDto);
    }

     public void flagEvent(Long eventId, String reason) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException(EVENT_NOT_FOUND));

        // Normalize reason (optional, but nice)
        String normalized = (reason == null || reason.isBlank())
                ? "Flagged by admin"
                : reason.trim();

        event.setFlagged(true);
        event.setFlagReason(normalized);
        eventRepository.save(event);
    }

    public Page<EventDetailsDto> getFlaggedEvents(Pageable pageable) {
        return eventRepository.findByFlaggedTrue(pageable)
                .map(adminMapper::toEventDetailsDto);
    }
}

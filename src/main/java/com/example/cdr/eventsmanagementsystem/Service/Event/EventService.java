package com.example.cdr.eventsmanagementsystem.Service.Event;

import java.util.List;

import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.UpdateEventDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.EventMapper;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.OrganizerRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class EventService implements IEventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final UserSyncService userSyncService;
    private final OrganizerRepository organizerRepository;

    public EventService(EventRepository eventRepository, EventMapper eventMapper, UserSyncService userSyncService, OrganizerRepository organizerRepository) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
        this.userSyncService = userSyncService;
        this.organizerRepository = organizerRepository;
    }

    @Override
    public EventResponseDTO createEvent(EventDTO eventDTO) {
        Organizer organizer = ensureCurrentUserAsOrganizer();
        Event event = eventMapper.toEventWithDefaults(eventDTO, organizer);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toEventResponseDTO(savedEvent);
    }

    private Organizer ensureCurrentUserAsOrganizer() {
        String userId = AuthUtil.getCurrentUserId();
        String email = userSyncService.getCurrentUserEmail();
        String firstName = userSyncService.getCurrentUserFirstName();
        String lastName = userSyncService.getCurrentUserLastName();
        
        Organizer organizer = organizerRepository.findById(userId).orElse(null);
        
        if (organizer == null) {
            organizer = new Organizer();
            organizer.setId(userId);
            organizer.setEmail(email);
            organizer.setFirstName(firstName);
            organizer.setLastName(lastName);
            
            organizer = organizerRepository.save(organizer);
        }
        
        return organizer;
    }

    @Override
    public EventResponseDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
        return eventMapper.toEventResponseDTO(event);
    }

    @Override
    public EventResponseDTO updateEvent(Long eventId, UpdateEventDTO updateDTO) {
        Event existingEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        eventMapper.updateEventFromDTO(updateDTO, existingEvent);

        Event savedEvent = eventRepository.save(existingEvent);
        return eventMapper.toEventResponseDTO(savedEvent);
    }

    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    @Override
    public Page<EventResponseDTO> getAllEvents(Pageable pageable) {
        Page<Event> eventPage = eventRepository.findAll(pageable);
        return eventPage.map(eventMapper::toEventResponseDTO);
    }

    @Override
    public List<EventResponseDTO> getEventsByType(EventType type) {
        List<Event> events = eventRepository.findByType(type);
        return events.stream().map(eventMapper::toEventResponseDTO).toList();
    }
}

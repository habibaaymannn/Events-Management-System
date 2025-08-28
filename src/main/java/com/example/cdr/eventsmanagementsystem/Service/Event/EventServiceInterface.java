package com.example.cdr.eventsmanagementsystem.Service.Event;

import java.util.List;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

/**
 * Service interface for managing events.
 */


public interface EventServiceInterface {
    EventResponseDTO createEvent(EventDTO eventDTO);
    EventResponseDTO getEventById(Long id);
    EventResponseDTO updateEvent(Long eventId, EventUpdateDTO updateDTO);
    void deleteEvent(Long id);
    Page<EventResponseDTO> getAllEvents(Pageable pageable);
    List<EventResponseDTO> getEventsByType(EventType type);
}

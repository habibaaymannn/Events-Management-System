package com.example.cdr.eventsmanagementsystem.Service.Event;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.UpdateEventDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

public interface EventServiceInterface {
    EventResponseDTO createEvent(EventDTO eventDTO);
    EventResponseDTO getEventById(Long id);
    EventResponseDTO updateEvent(Long eventId, UpdateEventDTO updateDTO);
    void deleteEvent(Long id);
    Page<EventResponseDTO> getAllEvents(Pageable pageable);
    List<EventResponseDTO> getEventsByType(EventType type);
}

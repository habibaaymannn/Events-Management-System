package com.example.cdr.eventsmanagementsystem.Controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.UpdateEventDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Service.Event.IEventService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/events")
public class EventController {
    private final IEventService eventService;

    @PostMapping
    // @PreAuthorize("hasRole('organizer')")
    public EventResponseDTO createEvent(@RequestBody EventDTO eventDTO) {
        return eventService.createEvent(eventDTO);
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee')")
    public EventResponseDTO getEventById(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('organizer')")
    public EventResponseDTO updateEvent(@PathVariable Long id, @RequestBody UpdateEventDTO updateEventDTO) {
        return eventService.updateEvent(id, updateEventDTO);
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('organizer')")
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }

    @GetMapping
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee')")
    public Page<EventResponseDTO> getAllEvents(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return eventService.getAllEvents(pageable);
    }

    @GetMapping("/type/{type}")
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee')")
    public List<EventResponseDTO> getEventsByType(@PathVariable EventType type) {
        return eventService.getEventsByType(type);
    }
}
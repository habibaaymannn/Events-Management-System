package com.example.cdr.eventsmanagementsystem.Controller;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Event", description = "Event management APIs")
public class EventController {
    private final IEventService eventService;

    @Operation(summary = "Create a new event", description = "Creates a new event with the provided details")
    @PostMapping
    // @PreAuthorize("hasRole('organizer')")
    public EventResponseDTO createEvent(@RequestBody EventDTO eventDTO) {
        return eventService.createEvent(eventDTO);
    }

    @Operation(summary = "Get event by ID", description = "Retrieves event details by its ID")
    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee')")
    public EventResponseDTO getEventById(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @Operation(summary = "Update an event", description = "Updates event details by ID")
    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('organizer')")
    public EventResponseDTO updateEvent(@PathVariable Long id, @RequestBody UpdateEventDTO updateEventDTO) {
        return eventService.updateEvent(id, updateEventDTO);
    }

    @Operation(summary = "Delete an event", description = "Deletes an event by its ID")
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('organizer')")
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }

    @Operation(summary = "Get all events", description = "Retrieves a paginated list of all events")
    @GetMapping
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee')")
    public Page<EventResponseDTO> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return eventService.getAllEvents(pageable);
    }

    @Operation(summary = "Get events by type", description = "Retrieves all events filtered by event type")
    @GetMapping("/type/{type}")
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee')")
    public List<EventResponseDTO> getEventsByType(@PathVariable EventType type) {
        return eventService.getEventsByType(type);
    }
}
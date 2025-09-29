package com.example.cdr.eventsmanagementsystem.Controller;

import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.EventsControllerConstants;
import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventResponseDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.EventUpdateDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Service.Event.EventService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for event management.
 * Provides endpoints to create, retrieve, update, delete, and list events,
 * as well as filter events by type.
 */
@RequiredArgsConstructor
@RestController
@RequestMapping(EventsControllerConstants.EVENT_BASE_URL)
@Tag(name = "Event", description = "Event management APIs")
public class EventController {
    private final EventService eventService;
    
    @Operation(summary = "Get All events", description = "Retrieves all events with pagination")
    @GetMapping(EventsControllerConstants.GET_ALL_EVENTS_URL)
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN_ROLE + "','" + RoleConstants.ATTENDEE_ROLE + "')")
    public Page<EventDetailsDto> getAllEvents(@ParameterObject @PageableDefault() Pageable pageable) {
        return eventService.getAllEvents(pageable);
    }

    @Operation(summary = "Get event by ID", description = "Retrieves event details by its ID")
    @GetMapping(EventsControllerConstants.GET_EVENT_BY_ID_URL)
    @PreAuthorize("hasAnyRole('" + RoleConstants.ORGANIZER_ROLE + "', '" + RoleConstants.ATTENDEE_ROLE + "')")
    public EventResponseDTO getEventById(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @Operation(summary = "Get events by type", description = "Retrieves all events filtered by event type")
    @GetMapping(EventsControllerConstants.GET_EVENTS_BY_TYPE_URL)
    @PreAuthorize("hasAnyRole('" + RoleConstants.ORGANIZER_ROLE + "', '" + RoleConstants.ATTENDEE_ROLE + "')")
    public List<EventResponseDTO> getEventsByType(@PathVariable EventType type) {
        return eventService.getEventsByType(type);
    }

    @Operation(summary = "Get events by organizer", description = "Retrieves all events created by the current organizer")
    @GetMapping(EventsControllerConstants.GET_EVENTS_BY_ORGANIZER_URL)
    @PreAuthorize("hasRole('" + RoleConstants.ORGANIZER_ROLE + "')")
    public Page<EventResponseDTO> getEventsByOrganizer(@ParameterObject @PageableDefault() Pageable pageable) {
        return eventService.getEventsByOrganizer(pageable);
    }

    @Operation(summary = "Create a new event", description = "Creates a new event with the provided details")
    @PostMapping(EventsControllerConstants.CREATE_EVENT_URL)
    @PreAuthorize("hasRole('" + RoleConstants.ORGANIZER_ROLE + "')")
    public EventResponseDTO createEvent(@RequestBody EventDTO eventDTO) {
        return eventService.createEvent(eventDTO);
    }

    @Operation(summary = "Update an event", description = "Updates event details by ID")
    @PutMapping(EventsControllerConstants.UPDATE_EVENT_URL)
    @PreAuthorize("hasRole('" + RoleConstants.ORGANIZER_ROLE + "')")
    public EventResponseDTO updateEvent(@PathVariable Long id, @RequestBody EventUpdateDTO updateEventDTO) {
        return eventService.updateEvent(id, updateEventDTO);
    }

    @Operation(summary = "Cancel an event", description = "Cancels an existing event")
    @PostMapping(EventsControllerConstants.CANCEL_EVENT_URL)
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN_ROLE + "', '" + RoleConstants.ORGANIZER_ROLE + "', '" + RoleConstants.ATTENDEE_ROLE + "')")
    public void cancelEvent(@PathVariable Long id) {
        eventService.cancelEvent(id);
    }

    @Operation(summary = "Flag an event", description = "Flags an event for review")
    @PostMapping(EventsControllerConstants.FLAG_EVENT_URL)
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
    public void flagEvent(@PathVariable Long eventId, @RequestParam String reason) {
        eventService.flagEvent(eventId, reason);
    }

    @Operation(summary = "Get flagged events", description = "Retrieves all flagged events with pagination")
    @GetMapping(EventsControllerConstants.GET_FLAGGED_EVENTS_URL)
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN_ROLE + "')")
    public Page<EventDetailsDto> getFlaggedEvents(@ParameterObject @PageableDefault() Pageable pageable) {
        return eventService.getFlaggedEvents(pageable);
    }
}
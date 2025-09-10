package com.example.cdr.eventsmanagementsystem.Service.User;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.Mapper.AdminMapper;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service class for administrative operations related events.
 * Handles Events.
 */

@Service
@RequiredArgsConstructor
public class AdminEventManagement {
    private final EventRepository eventRepository;
    private final AdminMapper adminMapper;

    public Page<EventDetailsDto> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable).map(adminMapper::toEventDetailsDto);
    }

    public Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable) {
        return eventRepository.findByStatus(status, pageable).map(adminMapper::toEventDetailsDto);
    }

    public void cancelEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

       public void flagEvent(Long eventId, String reason) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

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

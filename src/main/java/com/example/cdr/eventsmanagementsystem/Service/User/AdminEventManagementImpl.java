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
public class AdminEventManagementImpl implements AdminEventsManagement {
    private final EventRepository eventRepository;
    private final AdminMapper adminMapper;

    @Override
    public Page<EventDetailsDto> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable).map(adminMapper::toEventDetailsDto);
    }

    @Override
    public Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable) {
        return eventRepository.findByStatus(status, pageable).map(adminMapper::toEventDetailsDto);
    }

    @Override
    public void cancelEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }
}

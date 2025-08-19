package com.example.cdr.eventsmanagementsystem.Service.User;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
/**
 * Interface for managing and retrieving event-related information for admin operations.
 */

public interface AdminEventsManagement {
    Page<EventDetailsDto> getAllEvents(Pageable pageable);
    Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable);
    void cancelEvent(Long eventId);
}

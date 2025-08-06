package com.example.cdr.eventsmanagementsystem.Service.Event;

import java.util.List;

import javax.xml.stream.EventFilter;

import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.UpdateEventDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;

@Service
public interface IEventService {
    void createEvent(EventDTO event);
    Event getEventById(Long id);
    void updateEvent(UpdateEventDTO event);
    void deleteEvent(Long id);
    List<EventDTO> getAllEvents(Pageable pageable, EventFilter filter);
    List<EventDTO> getEventsByType(EventType type);
}

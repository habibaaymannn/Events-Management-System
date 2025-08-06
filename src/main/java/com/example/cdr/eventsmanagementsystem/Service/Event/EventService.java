package com.example.cdr.eventsmanagementsystem.Service.Event;

import java.util.List;

import javax.xml.stream.EventFilter;

import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Event.EventDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Event.UpdateEventDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.EventMapper;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;

@Service
public class EventService implements IEventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public EventService(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    public void createEvent(EventDTO eventDTO) {
        // TODO: Implement the logic to create an event
        throw new UnsupportedOperationException("Unimplemented method 'createEvent'");
    }

    @Override
    public Event getEventById(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getEventById'");
    }

    @Override
    public void updateEvent(UpdateEventDTO event) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateEvent'");
    }

    @Override
    public void deleteEvent(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteEvent'");
    }

    @Override
    public List<EventDTO> getAllEvents(Pageable pageable, EventFilter filter) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllEvents'");
    }

    @Override
    public List<EventDTO> getEventsByType(EventType type) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getEventsByType'");
    }


}

package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueMapper;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.Venue.VenueRepository;
import org.springframework.stereotype.Service;

@Service
public class VenueProvider {
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    public VenueProvider(VenueRepository venueRepository, VenueMapper venueMapper) {
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }
    public Venue addVenue(VenueDTO dto) {
        Venue newVenue = venueMapper.toVenue(dto);
        return venueRepository.save(newVenue);
    }

}

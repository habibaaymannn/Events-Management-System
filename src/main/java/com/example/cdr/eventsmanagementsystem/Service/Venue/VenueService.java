package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueMapper;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.Venue.VenueProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.Venue.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class VenueService {
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;
    private final VenueProviderRepository venueProviderRepository;

    public Venue addVenue(VenueDTO dto) {
        Venue newVenue = venueMapper.toVenue(dto);
        VenueProvider venueProvider = venueProviderRepository.findById(Math.toIntExact(dto.getVenueProviderId()))
                .orElseThrow(() -> new RuntimeException("VenueProvider not found"));

        newVenue.setVenueProvider(venueProvider);
        return venueRepository.save(newVenue);
    }
    public Venue updateVenue(Long id, VenueDTO dto) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        venueMapper.updateVenue(dto,venue);
        if (dto.getVenueProviderId() != null) {
            VenueProvider venueProvider = venueProviderRepository.findById(Math.toIntExact(dto.getVenueProviderId()))
                    .orElseThrow(() -> new RuntimeException("VenueProvider not found"));
            venue.setVenueProvider(venueProvider);
        }
        return venueRepository.save(venue);
    }
    public void deleteVenue(Long id) {
        venueRepository.deleteById(id);
    }

}

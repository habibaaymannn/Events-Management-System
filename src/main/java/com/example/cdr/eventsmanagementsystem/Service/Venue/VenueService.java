package com.example.cdr.eventsmanagementsystem.Service.Venue;

import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.DTO.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueMapper;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.VenueProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class VenueService implements IVenueService {
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;
    private final VenueProviderRepository venueProviderRepository;
    private final UserSyncService userSyncService;

    @Override
    public Venue addVenue(VenueDTO dto) {
        Venue newVenue = venueMapper.toVenue(dto);

        VenueProvider venueProvider = userSyncService.ensureVenueProviderExists();
        newVenue.setVenueProvider(venueProvider);

        return venueRepository.save(newVenue);
    }

    @Override
    public Venue updateVenue(Long id, VenueDTO dto) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        venueMapper.updateVenue(dto, venue);

        if (dto.getVenueProviderId() != null) {
            VenueProvider venueProvider = venueProviderRepository.findById(String.valueOf(dto.getVenueProviderId()))
                    .orElseThrow(() -> new RuntimeException("Venue provider (user) not found"));
            venue.setVenueProvider(venueProvider);
        }

        return venueRepository.save(venue);
    }

    @Override
    public void deleteVenue(Long id) {
        venueRepository.deleteById(id);
    }
}

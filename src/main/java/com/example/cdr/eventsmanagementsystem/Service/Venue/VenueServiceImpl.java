package com.example.cdr.eventsmanagementsystem.Service.Venue;

import org.springframework.security.access.AccessDeniedException;
import java.util.Objects;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueMapper;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import lombok.RequiredArgsConstructor;

/**
 * Service class for managing venues.
 * Provides functionality to create, update and delete venues
 */

@Slf4j
@RequiredArgsConstructor
@Service
public class VenueServiceImpl {
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;
    private final UserSyncService userSyncService;

    @Transactional
    public VenueDTO addVenue(VenueDTO dto) {
        Venue newVenue = venueMapper.toVenue(dto);
        VenueProvider venueProvider = userSyncService.ensureUserExists(VenueProvider.class);
        newVenue.setVenueProvider(venueProvider);
        Venue savedVenue = venueRepository.save(newVenue);
        return venueMapper.toVenueDTO(savedVenue);
    }

    @Transactional
    public VenueDTO updateVenue(Long venueId, VenueDTO dto) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

        String venueProviderId = AuthUtil.getCurrentUserId();
        verifyAccess(venue, venueProviderId);

        venueMapper.updateVenue(dto, venue);

        Venue updatedVenue = venueRepository.save(venue);
        return venueMapper.toVenueDTO(updatedVenue);
    }

    @Transactional
    public void deleteVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

        String venueProviderId = AuthUtil.getCurrentUserId();
        verifyAccess(venue, venueProviderId);

        venueRepository.deleteById(venueId);
    }

    private void verifyAccess(Venue venue,String venueProviderId) throws AccessDeniedException {
        if (Objects.isNull(venue.getVenueProvider())||
                !venue.getVenueProvider().getKeycloakId().equals(venueProviderId)) {
            throw new AccessDeniedException("You are not allowed to access this venue");
        }
    }
}
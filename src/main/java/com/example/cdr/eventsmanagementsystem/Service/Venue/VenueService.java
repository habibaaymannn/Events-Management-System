package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.Util.ImageUtil;
import org.springframework.security.access.AccessDeniedException;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.multipart.MultipartFile;

/**
 * Service class for managing venues.
 * Provides functionality to create, update and delete venues
 */

@Slf4j
@RequiredArgsConstructor
@Service
public class VenueService {
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;
    private final UserSyncService userSyncService;
    private final ImageUtil imageUtil;

    public Page<VenueDTO> getAllVenues(Pageable pageable) {
        Page<Venue> venues = venueRepository.findAll(pageable);
        return venues.map(venueMapper::toVenueDTO);
    }

    @Transactional
    public VenueDTO addVenue(VenueDTO dto, List<MultipartFile> files) throws IOException {
        Venue newVenue = venueMapper.toVenue(dto);
        newVenue.setImages(imageUtil.extractImageData(files));

        VenueProvider venueProvider = userSyncService.ensureUserExists(VenueProvider.class);
        newVenue.setVenueProvider(venueProvider);
        Venue savedVenue = venueRepository.save(newVenue);
        return venueMapper.toVenueDTO(savedVenue);
    }

    @Transactional
    public VenueDTO updateVenue(Long venueId, VenueDTO dto,  List<MultipartFile> newImages) throws IOException {
        Venue venue = verifyAccess(venueId);
        venueMapper.updateVenue(dto, venue);
        venue.setImages(imageUtil.mergeImages(venue.getImages(), newImages));
        Venue updatedVenue = venueRepository.save(venue);
        return venueMapper.toVenueDTO(updatedVenue);
    }

    public VenueDTO getVenueById(Long venueId) {
        Venue venue = verifyAccess(venueId);
        return venueMapper.toVenueDTO(venue);
    }

    @Transactional
    public void deleteVenue(Long venueId) {
        verifyAccess(venueId);

        venueRepository.deleteById(venueId);
    }

    private Venue verifyAccess(Long venueId) throws AccessDeniedException {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

        String venueProviderId = AuthUtil.getCurrentUserId();

        if (Objects.isNull(venue.getVenueProvider())||
                !venue.getVenueProvider().getKeycloakId().equals(venueProviderId)) {
            throw new AccessDeniedException("You are not allowed to access this venue");
        }
        return venue;
    }
}
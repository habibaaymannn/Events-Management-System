package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueBookingRepository;
import com.example.cdr.eventsmanagementsystem.Util.ImageUtil;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.access.AccessDeniedException;
import java.io.IOException;
import java.time.LocalDateTime;
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
    private final EventRepository eventRepository ;
    private final VenueBookingRepository venueBookingRepository ;
    private final VenueMapper venueMapper;
    private final UserSyncService userSyncService;
    private final ImageUtil imageUtil;

    public VenueDTO getVenueById(Long venueId) {
        Venue venue = getVenue(venueId);
        return venueMapper.toVenueDTO(venue);
    }

    public Page<VenueDTO> getVenuesByVenueProvider(Pageable pageable) {
        VenueProvider venueProvider = ensureCurrentUserAsVenueProvider();
        Page<Venue> venues = venueRepository.findByVenueProvider(venueProvider,pageable);
        return venues.map(venueMapper::toVenueDTO);
    }

    public Page<VenueDTO> getAllVenues(Pageable pageable) {
        Page<Venue> venues = venueRepository.findAll(pageable);
        return venues.map(venueMapper::toVenueDTO);
    }

    public Page<VenueDTO> getAvailableVenues(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        if (startDate.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        Page<Venue> allVenues = venueRepository.findAll(pageable);

        List<VenueDTO> availableVenueDTOs = allVenues.getContent().stream()
                .filter(venue -> isVenueAvailableDuringPeriod(venue.getId(), startDate, endDate))
                .map(venueMapper::toVenueDTO)
                .toList();

        return new PageImpl<>(availableVenueDTOs, pageable, availableVenueDTOs.size());
    }

    @Transactional
    public VenueDTO addVenue(VenueDTO dto, List<MultipartFile> files) throws IOException {
        Venue newVenue = venueMapper.toVenue(dto);
        newVenue.setImages(imageUtil.extractImageData(files));
        VenueProvider venueProvider = ensureCurrentUserAsVenueProvider();
        newVenue.setVenueProvider(venueProvider);
        Venue savedVenue = venueRepository.save(newVenue);
        return venueMapper.toVenueDTO(savedVenue);
    }

    @Transactional
    public VenueDTO updateVenue(Long venueId, VenueDTO dto,  List<MultipartFile> newImages) throws IOException {
        Venue venue = getVenue(venueId);
        verifyAccess(venue);
        venueMapper.updateVenue(dto, venue);
        venue.setImages(imageUtil.mergeImages(venue.getImages(), newImages));
        Venue updatedVenue = venueRepository.save(venue);
        return venueMapper.toVenueDTO(updatedVenue);
    }

    @Transactional
    public void deleteVenue(Long venueId) {
        Venue venue = getVenue(venueId);
        verifyAccess(venue);
        venueRepository.delete(venue);
    }

    private Venue getVenue(Long venueId) {
        return venueRepository.findById(venueId).orElseThrow(() -> new EntityNotFoundException("Venue not found"));
    }

    private void verifyAccess(Venue venue) throws AccessDeniedException {
        String venueProviderId = AuthUtil.getCurrentUserId();

        if (Objects.isNull(venue.getVenueProvider())|| !venue.getVenueProvider().getKeycloakId().equals(venueProviderId)) {
            throw new AccessDeniedException("You are not allowed to access this venue");
        }
    }

    private VenueProvider ensureCurrentUserAsVenueProvider() {
        return userSyncService.ensureUserExists(VenueProvider.class);
    }

    private boolean isVenueAvailableDuringPeriod(Long venueId, LocalDateTime startDate, LocalDateTime endDate) {
        // Step 1: Get all venue bookings for this venue
        List<VenueBooking> venueBookings = venueBookingRepository.findByVenueId(venueId);

        // Step 2: If no bookings exist, venue is available
        if (venueBookings == null || venueBookings.isEmpty()) {
            log.debug("Venue {} has no bookings - available", venueId);
            return true;
        }

        // Step 3: Extract event IDs from bookings (exclude cancelled bookings)
        List<Long> eventIds = venueBookings.stream()
                .filter(booking -> booking.getStatus() != BookingStatus.CANCELLED)
                .map(VenueBooking::getEventId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // If no valid event IDs, venue is available
        if (eventIds.isEmpty()) {
            log.debug("Venue {} has no active events - available", venueId);
            return true;
        }

        // Step 4: Check if any events overlap with the requested period

        boolean hasConflict = eventRepository.existsEventWithTimeConflict(eventIds, startDate, endDate);

        if (hasConflict) {
            log.debug("Venue {} has conflicting events during period {} to {}", venueId, startDate, endDate);
        }

        return !hasConflict;
    }
}
package com.example.cdr.eventsmanagementsystem.Service.Venue;

import java.nio.file.AccessDeniedException;
import java.util.HashSet;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.Mapper.BookingMapper;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class VenueService implements IVenueService {
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;
    private final VenueProviderRepository venueProviderRepository;
    private final UserSyncService userSyncService;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    @Transactional
    public VenueDTO addVenue(VenueDTO dto) {

        Venue newVenue = venueMapper.toVenue(dto);
        VenueProvider venueProvider = userSyncService.ensureVenueProviderExists();
        newVenue.setVenueProvider(venueProvider);

        if (newVenue.getSupportedEventTypes() == null) {
            newVenue.setSupportedEventTypes(new HashSet<>());
        }
        Venue savedVenue = venueRepository.save(newVenue);
        return venueMapper.toVenueDTO(savedVenue);
    }

    @Transactional
    public VenueDTO updateVenue(Long id, VenueDTO dto) throws AccessDeniedException {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venue not found"));

        String venueProviderId = AuthUtil.getCurrentUserId();
        if (venue.getVenueProvider() == null ||
                !venue.getVenueProvider().getKeycloakId().equals(venueProviderId)) {
            throw new AccessDeniedException("You are not allowed to update this venue");
        }

        venueMapper.updateVenue(dto, venue);

        if (dto.getVenueProviderId() != null) {
            VenueProvider venueProvider = venueProviderRepository.findById(String.valueOf(dto.getVenueProviderId()))
                    .orElseThrow(() -> new EntityNotFoundException("Venue provider (user) not found"));
            venue.setVenueProvider(venueProvider);
        }
        Venue updatedVenue = venueRepository.save(venue);
        return venueMapper.toVenueDTO(updatedVenue);
    }
@Transactional
    public void deleteVenue(Long id) throws AccessDeniedException {
    Venue venue = venueRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Venue not found"));
    String venueProviderId = AuthUtil.getCurrentUserId();
    if (venue.getVenueProvider() == null ||
            !venue.getVenueProvider().getKeycloakId().equals(venueProviderId)) {
        throw new AccessDeniedException("You are not allowed to delete this venue");
    }
    venueRepository.deleteById(id);
    }

    public Page<BookingDetailsResponse> getBookingsForVenueProvider(Pageable pageable) {
        String venueProviderId = AuthUtil.getCurrentUserId();
        Page<Booking> bookings = bookingRepository.findByVenue_VenueProvider_Id(venueProviderId, pageable);
        return bookings.map(bookingMapper::toBookingDetailsResponse);
    }
    @Transactional
    public void cancelBooking(Long bookingId) throws AccessDeniedException {
        String venueProviderId = AuthUtil.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (booking.getVenue() == null ||
                !booking.getVenue().getVenueProvider().getKeycloakId().equals(venueProviderId)) {
            throw new AccessDeniedException("You are not allowed to cancel this venue booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}
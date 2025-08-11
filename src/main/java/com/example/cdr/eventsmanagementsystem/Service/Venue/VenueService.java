package com.example.cdr.eventsmanagementsystem.Service.Venue;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueProviderRepository;
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

    public Venue addVenue(VenueDTO dto) {
        Venue newVenue = venueMapper.toVenue(dto);

        VenueProvider venueProvider = userSyncService.ensureVenueProviderExists();
        newVenue.setVenueProvider(venueProvider);

        return venueRepository.save(newVenue);
    }

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

    public void deleteVenue(Long id) {
        venueRepository.deleteById(id);
    }


    public List<Booking> getBookingsForVenueProvider() {
        String venueProviderId = AuthUtil.getCurrentUserId();
        return bookingRepository.findByVenue_VenueProvider_Id(venueProviderId);
    }
    @Transactional
    public void cancelBooking(Long bookingId) throws AccessDeniedException {
        String venueProviderId = AuthUtil.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getVenue() == null ||
                !booking.getVenue().getVenueProvider().getKeycloakId().equals(venueProviderId)) {
            throw new AccessDeniedException("You are not allowed to cancel this venue booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

}
package com.example.cdr.eventsmanagementsystem.Service.Venue;

import com.example.cdr.eventsmanagementsystem.DTO.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.VenueMapper;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.AccessDeniedException;
import static com.example.cdr.eventsmanagementsystem.Util.AuthUtil.getCurrentUserKeyclokId;

@RequiredArgsConstructor
@Service
public class VenueService implements IVenueService{
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;
    private final VenueProviderRepository venueProviderRepository;

    @Transactional
    public Venue addVenue(VenueDTO dto) {
        Venue newVenue = venueMapper.toVenue(dto);

        String keycloakId = getCurrentUserKeyclokId();
        VenueProvider venueProvider = venueProviderRepository.findById(keycloakId)
                .orElseThrow(() -> new RuntimeException("Venue provider (user) not found"));

        newVenue.setVenueProvider(venueProvider);
        return venueRepository.save(newVenue);
    }

    @Transactional
    public Venue updateVenue(Long id, VenueDTO dto) throws AccessDeniedException {
        String keycloakId = getCurrentUserKeyclokId();
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        venueMapper.updateVenue(dto, venue);

        if (!venue.getVenueProvider().getKeycloakId().equals(keycloakId)) {
            throw new AccessDeniedException("You are not allowed to update this venue");
        }

        return venueRepository.save(venue);
    }

    public void deleteVenue(Long id) {
        venueRepository.deleteById(id);
    }

}

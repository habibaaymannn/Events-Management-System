package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class VenueProviderStrategy implements IUserService{
    private final VenueProviderRepository venueProviderRepository;
    @Override
    public void saveUserData(UserDTO userDTO) {
        VenueProvider venueProvider = venueProviderRepository.findById(userDTO.getKeycloakId())
                .orElseGet(() -> {
                    VenueProvider newProvider = new VenueProvider();
                    newProvider.setId(userDTO.getKeycloakId());
                    return newProvider;
                });

        venueProvider.setEmail(userDTO.getEmail());
        venueProvider.setFirstName(userDTO.getFirstName());
        venueProvider.setLastName(userDTO.getLastName());

        venueProviderRepository.save(venueProvider);
    }
    @Override
    public boolean supports(String userType) {
        return "venue_provider".equalsIgnoreCase(userType);
    }
}

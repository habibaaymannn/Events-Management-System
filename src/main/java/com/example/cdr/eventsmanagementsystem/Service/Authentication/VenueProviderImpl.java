package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class VenueProviderImpl implements IUserService{
    private final VenueProviderRepository venueProviderRepository;
    private final  KeycloakService keycloakService;

    @Override
    @Transactional
    public void register(UserDTO userDTO) {
        VenueProvider venueProvider = new VenueProvider();
        venueProvider.setEmail(userDTO.getEmail());
        venueProvider.setFirstName(userDTO.getFirstName());
        venueProvider.setLastName(userDTO.getLastName());
        venueProvider.setPassword(userDTO.getPassword());

        if (venueProviderRepository.existsByEmail(venueProvider.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String keycloakUserId = keycloakService.createUser(
                venueProvider.getEmail(),
                venueProvider.getFirstName(),
                venueProvider.getLastName(),
                venueProvider.getPassword()
        );
        keycloakService.assignRoleToUser(keycloakUserId, "venue_provider");

        venueProvider.setId(keycloakUserId);

        venueProviderRepository.save(venueProvider);
    }
    @Override
    public String getUserType() {
        return "venue_provider";
    }
}

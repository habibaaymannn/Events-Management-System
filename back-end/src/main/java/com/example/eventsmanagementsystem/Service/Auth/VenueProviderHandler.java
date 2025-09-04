package com.example.eventsmanagementsystem.Service.Auth;

import com.example.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Handler for managing VenueProvider users.
 * Provides methods to create, retrieve, save, and delete VenueProvider users
 * and supports role-based operations for the "venue_provider" role.
 */

@Component
@RequiredArgsConstructor
public class VenueProviderHandler implements UserRoleHandler<VenueProvider> {

    private final VenueProviderRepository venueProviderRepository;

    @Override
    public boolean supports(String role) {
        return "venue_provider".equalsIgnoreCase(role);
    }

    @Override
    @Transactional
    public VenueProvider findUserById(String userId) {
        return venueProviderRepository.findById(userId).orElse(null);
    }

    @Override
    @Transactional
    public VenueProvider createNewUser(String userId, String email, String firstName, String lastName) {
        Optional<VenueProvider> existingUser = venueProviderRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        VenueProvider venueProvider = new VenueProvider();
        venueProvider.setId(userId);
        venueProvider.setEmail(email);
        venueProvider.setFirstName(firstName);
        venueProvider.setLastName(lastName);
        venueProvider.setActive(true);
        return venueProviderRepository.save(venueProvider);
    }

    @Override
    @Transactional
    public BaseRoleEntity saveUser(BaseRoleEntity user) {
        return venueProviderRepository.save((VenueProvider) user);
    }

}

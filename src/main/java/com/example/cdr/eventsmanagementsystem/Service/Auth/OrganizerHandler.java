package com.example.cdr.eventsmanagementsystem.Service.Auth;

import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.OrganizerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Handler for managing organizer users.
 * Provides methods to create, retrieve, save, and delete Organizer users
 * and supports role-based operations for the "organizer" role.
 */

@Component
@RequiredArgsConstructor
public class OrganizerHandler implements UserRoleHandler<Organizer> {

    private final OrganizerRepository organizerRepository;

    @Override
    public boolean supports(String role) {
        return "organizer".equalsIgnoreCase(role);
    }

    @Override
    @Transactional
    public Organizer findUserById(String userId) {
        return organizerRepository.findById(userId).orElse(null);
    }

    @Override
    @Transactional
    public Organizer createNewUser(String userId, String email, String firstName, String lastName) {
        Optional<Organizer> existingUser = organizerRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        Organizer organizer = new Organizer();
        organizer.setId(userId);
        organizer.setEmail(email);
        organizer.setFirstName(firstName);
        organizer.setLastName(lastName);
        return organizerRepository.save(organizer);
    }

    @Override
    @Transactional
    public BaseRoleEntity saveUser(BaseRoleEntity user) {
        return organizerRepository.save((Organizer) user);
    }

}

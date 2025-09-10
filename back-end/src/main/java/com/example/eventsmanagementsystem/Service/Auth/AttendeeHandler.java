package com.example.eventsmanagementsystem.Service.Auth;

import com.example.eventsmanagementsystem.Model.User.Attendee;
import com.example.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.eventsmanagementsystem.Repository.UsersRepository.AttendeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Handler for managing Attendee users.
 * Provides methods to create, retrieve, save, and delete Attendee users
 * and supports role-based operations for the "attendee" role.
 */

@Component
@RequiredArgsConstructor
public class AttendeeHandler implements UserRoleHandler<Attendee> {

    private final AttendeeRepository attendeeRepository;

    @Override
    public boolean supports(String role) {
        return "attendee".equalsIgnoreCase(role);
    }

    @Override
    @Transactional
    public Attendee findUserById(String userId) {
        return attendeeRepository.findById(userId).orElse(null);
    }

    @Override
    @Transactional
    public Attendee createNewUser(String userId, String email, String firstName, String lastName) {
        Optional<Attendee> existingUser = attendeeRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        Attendee attendee = new Attendee();
        attendee.setId(userId);
        attendee.setEmail(email);
        attendee.setFirstName(firstName);
        attendee.setLastName(lastName);
        return attendeeRepository.save(attendee);
    }

    @Override
    public BaseRoleEntity saveUser(BaseRoleEntity user) {
        return attendeeRepository.save((Attendee) user);
    }

}

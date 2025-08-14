package com.example.cdr.eventsmanagementsystem.Service.Auth;

import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.OrganizerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class OrganizerHandler implements UserRoleHandler<Organizer> {

    private final OrganizerRepository organizerRepository;

    @Override
    public boolean supports(String role) {
        return "organizer".equalsIgnoreCase(role);
    }

    @Override
    public Class<Organizer> getRoleClass() {
        return Organizer.class;
    }

    @Override
    @Transactional
    public Organizer findUserById(String userId) {
        return organizerRepository.findById(userId).orElse(null);
    }

    @Override
    @Transactional
    public Organizer createNewUser(String userId, String email, String firstName, String lastName) {
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

    @Override
    @Transactional
    public void deleteUser(String userId) {

        organizerRepository.deleteById(userId);
    }
}

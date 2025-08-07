package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.OrganizerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class OrganizerImpl implements IUserService{
    private final OrganizerRepository organizerRepository;
    private final  KeycloakService keycloakService;

    @Override
    @Transactional
    public void register(UserDTO userDTO) {
        Organizer organizer = new Organizer();
        organizer.setEmail(userDTO.getEmail());
        organizer.setFirstName(userDTO.getFirstName());
        organizer.setLastName(userDTO.getLastName());
        organizer.setPassword(userDTO.getPassword());

        if (organizerRepository.existsByEmail(organizer.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String keycloakUserId = keycloakService.createUser(
                organizer.getEmail(),
                organizer.getFirstName(),
                organizer.getLastName(),
                organizer.getPassword()
        );
        keycloakService.assignRoleToUser(keycloakUserId, "event_organizer");

        organizer.setId(keycloakUserId);

        organizerRepository.save(organizer);
    }
    @Override
    public String getUserType() {
        return "event_organizer";
    }
}

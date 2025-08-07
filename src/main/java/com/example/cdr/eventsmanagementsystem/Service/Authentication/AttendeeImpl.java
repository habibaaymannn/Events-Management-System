package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AttendeeRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.OrganizerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class AttendeeImpl implements IUserService{
    private final AttendeeRepository attendeeRepository;
    private final  KeycloakService keycloakService;

    @Override
    @Transactional
    public void register(UserDTO userDTO) {
        Attendee attendee = new Attendee();
        attendee.setEmail(userDTO.getEmail());
        attendee.setFirstName(userDTO.getFirstName());
        attendee.setLastName(userDTO.getLastName());
        attendee.setPassword(userDTO.getPassword());

        if (attendeeRepository.existsByEmail(attendee.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String keycloakUserId = keycloakService.createUser(
                attendee.getEmail(),
                attendee.getFirstName(),
                attendee.getLastName(),
                attendee.getPassword()
        );
        keycloakService.assignRoleToUser(keycloakUserId, "event_attendee");

        attendee.setId(keycloakUserId);

        attendeeRepository.save(attendee);
    }
    @Override
    public String getUserType() {
        return "event_attendee";
    }
}

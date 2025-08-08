package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.OrganizerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class OrganizerStrategy implements IUserService{
    private final OrganizerRepository organizerRepository;
    @Override
    public void saveUserData(UserDTO userDTO) {
        Organizer organizer = organizerRepository.findById(userDTO.getKeycloakId())
                .orElseGet(() -> {
                    Organizer newOrganizer = new Organizer();
                    newOrganizer.setId(userDTO.getKeycloakId());
                    return newOrganizer;
                });

        organizer.setEmail(userDTO.getEmail());
        organizer.setFirstName(userDTO.getFirstName());
        organizer.setLastName(userDTO.getLastName());

        organizerRepository.save(organizer);
    }
    @Override
    public boolean supports(String userType) {
        return "event_organizer".equalsIgnoreCase(userType);
    }
}

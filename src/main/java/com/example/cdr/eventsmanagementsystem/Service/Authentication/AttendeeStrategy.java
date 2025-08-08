package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AttendeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AttendeeStrategy implements IUserService{
    private final AttendeeRepository attendeeRepository;
    @Override
    public void saveUserData(UserDTO userDTO) {
        Attendee attendee = attendeeRepository.findById(userDTO.getKeycloakId())
                .orElseGet(() -> {
                    Attendee newAttendee = new Attendee();
                    newAttendee.setId(userDTO.getKeycloakId());
                    return newAttendee;
                });

        attendee.setEmail(userDTO.getEmail());
        attendee.setFirstName(userDTO.getFirstName());
        attendee.setLastName(userDTO.getLastName());

        attendeeRepository.save(attendee);
    }
    @Override
    public boolean supports(String userType) {
        return "event_attendee".equalsIgnoreCase(userType);
    }
}

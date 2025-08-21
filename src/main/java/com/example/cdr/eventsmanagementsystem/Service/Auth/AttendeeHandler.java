package com.example.cdr.eventsmanagementsystem.Service.Auth;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AttendeeRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AttendeeHandler implements UserRoleHandler<Attendee> {

	private final AttendeeRepository attendeeRepository;

	@Override
	public boolean supports(String role) {
		return "attendee".equalsIgnoreCase(role);
	}

	@Override
	public Class<Attendee> getRoleClass() {
		return Attendee.class;
	}

	@Override
	@Transactional
	public Attendee findUserById(String userId) {
		return attendeeRepository.findById(userId).orElse(null);
	}

	@Override
	@Transactional
	public Attendee createNewUser(String userId, String email, String firstName, String lastName) {
		Attendee existing = attendeeRepository.findByEmail(email).orElse(null);
		if (existing != null) {
			existing.setFirstName(firstName);
			existing.setLastName(lastName);
			return attendeeRepository.save(existing);
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

	@Override
	@Transactional
	public void deleteUser(String userId) {
		attendeeRepository.deleteById(userId);
	}
}

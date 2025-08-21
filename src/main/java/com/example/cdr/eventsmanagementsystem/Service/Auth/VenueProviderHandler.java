package com.example.cdr.eventsmanagementsystem.Service.Auth;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class VenueProviderHandler implements UserRoleHandler<VenueProvider> {

	private final VenueProviderRepository venueProviderRepository;

	@Override
	public boolean supports(String role) {
		return "venue_provider".equalsIgnoreCase(role);
	}

	@Override
	public Class<VenueProvider> getRoleClass() {
		return VenueProvider.class;
	}

	@Override
	@Transactional
	public VenueProvider findUserById(String userId) {
		return venueProviderRepository.findById(userId).orElse(null);
	}

	@Override
	@Transactional
	public VenueProvider createNewUser(String userId, String email, String firstName, String lastName) {
		VenueProvider existing = venueProviderRepository.findByEmail(email).orElse(null);
		if (existing != null) {
			existing.setFirstName(firstName);
			existing.setLastName(lastName);
			existing.setActive(true);
			return venueProviderRepository.save(existing);
		}
		
		// Create new venue provider if none exists with this email
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

	@Override
	@Transactional
	public void deleteUser(String userId) {
		venueProviderRepository.deleteById(userId);
	}
}

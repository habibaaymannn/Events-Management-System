package com.example.cdr.eventsmanagementsystem.Service.Auth;

import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.ServiceProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ServiceProviderHandler implements UserRoleHandler<ServiceProvider> {

    private final ServiceProviderRepository serviceProviderRepository;

    @Override
    public boolean supports(String role) {
        return "service provider".equalsIgnoreCase(role);
    }

    @Override
    public Class<ServiceProvider> getRoleClass() {
        return ServiceProvider.class;
    }

    @Override
    @Transactional
    public ServiceProvider findUserById(String userId) {
        return serviceProviderRepository.findById(userId).orElse(null);
    }

    @Override
    @Transactional
    public ServiceProvider createNewUser(String userId, String email, String firstName, String lastName) {
        ServiceProvider serviceProvider = new ServiceProvider();
        serviceProvider.setId(userId);
        serviceProvider.setEmail(email);
        serviceProvider.setFirstName(firstName);
        serviceProvider.setLastName(lastName);
        serviceProvider.setActive(true);
        return serviceProviderRepository.save(serviceProvider);
    }

    @Override
    @Transactional
    public void deleteUser(String userId) {
        serviceProviderRepository.deleteById(userId);
    }

    @Override
    @Transactional
    public BaseRoleEntity saveUser(BaseRoleEntity user) {
        return serviceProviderRepository.save((ServiceProvider) user);
    }
}

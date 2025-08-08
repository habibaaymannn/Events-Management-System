package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.ServiceProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ServiceProviderStrategy implements IUserService{
    private final ServiceProviderRepository serviceProviderRepository;
    @Override
    public void saveUserData(UserDTO userDTO) {
        ServiceProvider serviceProvider = serviceProviderRepository.findById(userDTO.getKeycloakId())
                .orElseGet(() -> {
                    ServiceProvider newProvider = new ServiceProvider();
                    newProvider.setId(userDTO.getKeycloakId());
                    return newProvider;
                });

        serviceProvider.setEmail(userDTO.getEmail());
        serviceProvider.setFirstName(userDTO.getFirstName());
        serviceProvider.setLastName(userDTO.getLastName());

        serviceProviderRepository.save(serviceProvider);
    }
    @Override
    public boolean supports(String userType) {
        return "service_provider".equalsIgnoreCase(userType);
    }
}

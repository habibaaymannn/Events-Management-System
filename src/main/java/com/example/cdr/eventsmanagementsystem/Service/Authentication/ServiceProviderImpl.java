package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.ServiceProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ServiceProviderImpl implements IUserService{
    private final ServiceProviderRepository serviceProviderRepository;
    private final  KeycloakService keycloakService;

    @Override
    @Transactional
    public void register(UserDTO userDTO) {
        ServiceProvider serviceProvider = new ServiceProvider();
        serviceProvider.setEmail(userDTO.getEmail());
        serviceProvider.setFirstName(userDTO.getFirstName());
        serviceProvider.setLastName(userDTO.getLastName());
        serviceProvider.setPassword(userDTO.getPassword());

        if (serviceProviderRepository.existsByEmail(serviceProvider.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String keycloakUserId = keycloakService.createUser(
                serviceProvider.getEmail(),
                serviceProvider.getFirstName(),
                serviceProvider.getLastName(),
                serviceProvider.getPassword()
        );
        keycloakService.assignRoleToUser(keycloakUserId, "service_provider");

        serviceProvider.setId(keycloakUserId);

        serviceProviderRepository.save(serviceProvider);
    }
    @Override
    public String getUserType() {
        return "service_provider";
    }
}

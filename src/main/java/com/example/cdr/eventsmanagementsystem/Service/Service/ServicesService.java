package com.example.cdr.eventsmanagementsystem.Service.Service;

import com.example.cdr.eventsmanagementsystem.Model.Service.Availability;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.ServiceProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ServicesService implements IServicesService{
    private final ServiceRepository serviceRepository;
    private final ServiceProviderRepository serviceProviderRepository;

    @Transactional
    public Services addService(Services service) {
        String serviceProviderId = AuthUtil.getCurrentUserKeyclokId();
        ServiceProvider serviceProvider = serviceProviderRepository.findById(serviceProviderId).
                orElseThrow(() -> new IllegalArgumentException("Service Provider not found"));

        service.setServiceProvider(serviceProvider);
        return serviceRepository.save(service);
    }
    @Transactional
    public Services updateAvailability(Long serviceId) throws AccessDeniedException {
        String keycloakId = AuthUtil.getCurrentUserKeyclokId();
        Services service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceId));

        if (!service.getServiceProvider().getKeycloakId().equals(keycloakId)) {
            throw new AccessDeniedException("You are not allowed to update availability of this service");
        }
        service.setAvailability(service.getAvailability() == Availability.AVAILABLE
                ? Availability.UNAVAILABLE
                : Availability.AVAILABLE);

        return serviceRepository.save(service);
    }

    public List<Services> getAllServicesByProvider(String providerId) {
        return serviceRepository.findByServiceProviderId(providerId);
    }
}

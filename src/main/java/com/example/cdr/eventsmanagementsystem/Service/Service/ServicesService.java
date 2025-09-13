package com.example.cdr.eventsmanagementsystem.Service.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.ServiceMapper;
import com.example.cdr.eventsmanagementsystem.Model.Service.Availability;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
/**
 * Service class for managing services.
 * Provides functionality to create, updateAvailability
 * respond to booking requests of services
 */
@RequiredArgsConstructor
@Service
public class ServicesService {
    private final ServiceRepository serviceRepository;
    private final UserSyncService userSyncService;
    private final ServiceMapper serviceMapper;

    public Page<ServicesDTO> getAllServices(Pageable pageable) {
        Page<Services> services = serviceRepository.findAll(pageable);
        return services.map(serviceMapper::toServiceDTO);
    }

    @Transactional
    public ServicesDTO addService(ServicesDTO dto) {
        Services newService = serviceMapper.toService(dto);

        ServiceProvider serviceProvider = userSyncService.ensureUserExists(ServiceProvider.class);
        newService.setServiceProvider(serviceProvider);

        Services savedService = serviceRepository.save(newService);
        return serviceMapper.toServiceDTO(savedService);
    }

    @Transactional
    public ServicesDTO updateService(Long serviceId, ServicesDTO dto) {
        Services service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));

        String serviceProviderId = AuthUtil.getCurrentUserId();
        if (!service.getServiceProvider().getKeycloakId().equals(serviceProviderId)) {
            throw new AccessDeniedException("You are not allowed to update this service");
        }

        serviceMapper.updateService(dto, service);

        Services updatedVenue = serviceRepository.save(service);
        return serviceMapper.toServiceDTO(updatedVenue);
    }

    public ServicesDTO getServiceById(Long serviceId) {
        Services service = serviceRepository.findById(serviceId).orElseThrow(() -> new EntityNotFoundException("Service not found"));
        return serviceMapper.toServiceDTO(service);
    }

    @Transactional
    public void deleteService(Long serviceId) {
        Services service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));

        String serviceProviderId = AuthUtil.getCurrentUserId();

        if (!service.getServiceProvider().getKeycloakId().equals(serviceProviderId)) {
            throw new AccessDeniedException("You are not allowed to delete this service");
        }

        serviceRepository.deleteById(serviceId);
    }
}

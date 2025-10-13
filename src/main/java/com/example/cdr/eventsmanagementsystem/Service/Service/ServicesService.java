package com.example.cdr.eventsmanagementsystem.Service.Service;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.ServiceMapper;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import com.example.cdr.eventsmanagementsystem.Util.ImageUtil;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

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
    private final ImageUtil imageUtil;

    public ServicesDTO getServiceById(Long serviceId) {
        Services service = getService(serviceId);
        return serviceMapper.toServiceDTO(service);
    }

    public Page<ServicesDTO> getServicesByServiceProvider(Pageable pageable) {
        ServiceProvider serviceProvider = ensureCurrentUserAsServiceProvider();
        Page<Services> services = serviceRepository.findByServiceProvider(serviceProvider, pageable);
        return services.map(serviceMapper::toServiceDTO);
    }

    public Page<ServicesDTO> getAllServices(Pageable pageable) {
        Page<Services> services = serviceRepository.findAll(pageable);
        return services.map(serviceMapper::toServiceDTO);
    }

    public ServicesDTO addService(ServicesDTO dto, List<MultipartFile> files) throws IOException{
        Services newService = serviceMapper.toService(dto);
        newService.setImages(imageUtil.extractImageData(files));
        ServiceProvider serviceProvider = ensureCurrentUserAsServiceProvider();
        newService.setServiceProvider(serviceProvider);
        Services savedService = serviceRepository.save(newService);
        return serviceMapper.toServiceDTO(savedService);
    }

    public ServicesDTO updateService(Long serviceId, ServicesDTO dto, List<MultipartFile> newImages) throws IOException {
        Services service = getService(serviceId);
        verifyAccess(service);
        serviceMapper.updateService(dto, service);
        service.setImages(imageUtil.mergeImages(service.getImages(), newImages));
        Services updatedVenue = serviceRepository.save(service);
        return serviceMapper.toServiceDTO(updatedVenue);
    }

    @Transactional
    public void deleteService(Long serviceId) {
        Services service = getService(serviceId);
        verifyAccess(service);
        serviceRepository.deleteById(serviceId);
    }

    private Services getService(Long serviceId) {
        return serviceRepository.findById(serviceId).orElseThrow(() -> new EntityNotFoundException("Service not found"));
    }

    private void verifyAccess(Services service) throws AccessDeniedException {
        String serviceProviderId = AuthUtil.getCurrentUserId();

        if (Objects.isNull(service.getServiceProvider())|| !service.getServiceProvider().getKeycloakId().equals(serviceProviderId)) {
            throw new AccessDeniedException("You are not allowed to access this venue");
        }
    }

    private ServiceProvider ensureCurrentUserAsServiceProvider() {
        return userSyncService.ensureUserExists(ServiceProvider.class);
    }
}

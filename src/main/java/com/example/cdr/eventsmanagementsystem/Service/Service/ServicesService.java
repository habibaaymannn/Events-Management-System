package com.example.cdr.eventsmanagementsystem.Service.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceBookingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.ServiceMapper;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
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
    private final ServiceBookingRepository serviceBookingRepository ;
    private final EventRepository eventRepository;

    public ServicesDTO getServiceById(Long serviceId) {
        Services service = getService(serviceId);
        return serviceMapper.toServiceDTO(service);
    }


    public Page<ServicesDTO> getAvailableServices(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        if (startDate.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        Page<Services> allServices = serviceRepository.findAll(pageable);

        List<ServicesDTO> availableServiceDTOs = allServices.getContent().stream()
                .filter(service -> isServiceAvailableDuringPeriod(service.getId(), startDate, endDate))
                .map(serviceMapper::toServiceDTO)
                .toList();

        return new PageImpl<>(availableServiceDTOs, pageable, availableServiceDTOs.size());
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

    public ServicesDTO addService(ServicesDTO dto) {
        Services newService = serviceMapper.toService(dto);
        ServiceProvider serviceProvider = ensureCurrentUserAsServiceProvider();
        newService.setServiceProvider(serviceProvider);
        Services savedService = serviceRepository.save(newService);
        return serviceMapper.toServiceDTO(savedService);
    }

    public ServicesDTO updateService(Long serviceId, ServicesDTO dto) {
        Services service = getService(serviceId);
        verifyAccess(service);
        serviceMapper.updateService(dto, service);
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


    private boolean isServiceAvailableDuringPeriod(Long serviceId, LocalDateTime startDate, LocalDateTime endDate) {

        System.out.println("Checking availability for Service ID: ==> " + serviceId +
                " from " + startDate + " to " + endDate);
        List<ServiceBooking> serviceBookings = serviceBookingRepository.findBookingsByServiceId(serviceId);

        if ( Objects.isNull(serviceBookings) || serviceBookings.isEmpty()) {
            return true;
        }

        List<Long> eventIds = serviceBookings.stream()
                .filter(booking -> booking.getStatus() != BookingStatus.CANCELLED)
                .map(ServiceBooking::getEventId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (eventIds.isEmpty()) {
            return true;
        }

        boolean hasConflict = eventRepository.existsEventWithTimeConflict(eventIds, startDate, endDate);

        return !hasConflict;
    }
}

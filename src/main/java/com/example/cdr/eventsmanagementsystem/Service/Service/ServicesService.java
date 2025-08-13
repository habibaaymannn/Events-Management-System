package com.example.cdr.eventsmanagementsystem.Service.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Mapper.BookingMapper;
import com.example.cdr.eventsmanagementsystem.Mapper.ServiceMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Service.Availability;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.ServiceProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Util.AuthUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.AccessDeniedException;
import java.util.HashSet;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ServicesService implements IServicesService{
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final UserSyncService userSyncService;
    private final ServiceMapper serviceMapper;
    private final BookingMapper bookingMapper;

    @Transactional
    public ServicesDTO addService(ServicesDTO dto) {
        Services newService = serviceMapper.toService(dto);

        ServiceProvider serviceProvider = userSyncService.ensureServiceProviderExists();
        newService.setServiceProvider(serviceProvider);

        Services savedService = serviceRepository.save(newService);
        return serviceMapper.toServiceDTO(savedService);
    }

    @Transactional
    public ServicesDTO updateAvailability(Long serviceId) throws AccessDeniedException {
        String keycloakId = AuthUtil.getCurrentUserId();
        Services service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));

        if (!service.getServiceProvider().getKeycloakId().equals(keycloakId)) {
            throw new AccessDeniedException("You are not allowed to update availability of this service");
        }
        service.setAvailability(service.getAvailability() == Availability.AVAILABLE
                ? Availability.UNAVAILABLE
                : Availability.AVAILABLE);

        return serviceMapper.toServiceDTO(serviceRepository.save(service));
    }

    public Page<BookingDetailsResponse> getBookingsForServiceProvider(Pageable pageable) {
        String serviceProviderId = AuthUtil.getCurrentUserId();
        Page<Booking> bookings = bookingRepository.findByService_ServiceProvider_Id(serviceProviderId,pageable);
        return bookings.map(bookingMapper::toBookingDetailsResponse);
    }
    @Transactional
    public Booking respondToBookingRequests (Long bookingId, BookingStatus status) throws AccessDeniedException {
        String serviceProviderId = AuthUtil.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if(!booking.getService().getServiceProvider().getKeycloakId().equals(serviceProviderId)) {
            throw new AccessDeniedException("You are not allowed to respond to this service");
        }
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
    @Transactional
    public void cancelBooking(Long bookingId) throws AccessDeniedException {
        String serviceProviderId = AuthUtil.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if(!booking.getService().getServiceProvider().getKeycloakId().equals(serviceProviderId)) {
            throw new AccessDeniedException("You are not allowed to cancel this service");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}

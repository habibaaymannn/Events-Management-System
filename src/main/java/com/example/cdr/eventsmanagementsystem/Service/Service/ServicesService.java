package com.example.cdr.eventsmanagementsystem.Service.Service;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Service.Availability;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
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
    private final BookingRepository bookingRepository;
    private final UserSyncService userSyncService;

    @Transactional
    public Services addService(Services service) {
        ServiceProvider serviceProvider = userSyncService.ensureServiceProviderExists();
        service.setServiceProvider(serviceProvider);
        return serviceRepository.save(service);
    }

    @Transactional
    public Services updateAvailability(Long serviceId) throws AccessDeniedException {
        String keycloakId = AuthUtil.getCurrentUserId();
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

    public List<Booking> getBookingsForServiceProvider() {
        String serviceProviderId = AuthUtil.getCurrentUserId();
        return bookingRepository.findByService_ServiceProvider_Id(serviceProviderId);
    }
    @Transactional
    public Booking respondToBookingRequests (Long bookingId, BookingStatus status) throws AccessDeniedException {
        String serviceProviderId = AuthUtil.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

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
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if(!booking.getService().getServiceProvider().getKeycloakId().equals(serviceProviderId)) {
            throw new AccessDeniedException("You are not allowed to cancel this service");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

    }

}

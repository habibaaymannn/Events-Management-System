package com.example.cdr.eventsmanagementsystem.Service.Booking;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ServiceBooking {
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final ApplicationEventPublisher eventPublisher;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    @Transactional
    public Booking createBooking(Booking booking) {
        Long serviceId = booking.getService().getId();

        Services service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));
        booking.setService(service);
        booking.setStatus(BookingStatus.BOOKED);

        Booking savedBooking = bookingRepository.save(booking);

        eventPublisher.publishEvent(new ServiceBooked(service));
        return savedBooking;
    }
    @Transactional
    public void CancelBooking(Long id) {
        Booking booking = bookingRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        eventPublisher.publishEvent(new ServiceCancelled(booking.getService()));
    }
}

package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.VenueBooked;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;

import lombok.RequiredArgsConstructor;

// This class wll be deleted - we will not use it

@RequiredArgsConstructor
@Service
public class VenueBookingService {
    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final ApplicationEventPublisher eventPublisher;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    @Transactional
    public Booking createBooking(Booking booking) {
        Long venueId = booking.getVenue().getId();
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        booking.setVenue(venue);
        Booking savedBooking = bookingRepository.save(booking);

        eventPublisher.publishEvent(new VenueBooked(venue));
        return savedBooking;
    }
    @Transactional
    public void CancelBooking(Long id) {
        // Booking booking = bookingRepository.findById(Math.toIntExact(id))
        //         .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        // booking.setStatus(BookingStatus.CANCELLED);
        // bookingRepository.save(booking);

        // eventPublisher.publishEvent(new VenueCancelled(booking.getVenue()));
    }
}

package com.example.eventsmanagementsystem.Util;

import com.example.eventsmanagementsystem.Model.Booking.Booking;
import com.example.eventsmanagementsystem.Model.Booking.EventBooking;
import com.example.eventsmanagementsystem.Model.Booking.ServiceBooking;
import com.example.eventsmanagementsystem.Model.Booking.VenueBooking;
import com.example.eventsmanagementsystem.Model.Event.Event;
import com.example.eventsmanagementsystem.Model.Service.Services;
import com.example.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.eventsmanagementsystem.Model.Venue.Venue;
import com.example.eventsmanagementsystem.Repository.EventRepository;
import com.example.eventsmanagementsystem.Repository.ServiceRepository;
import com.example.eventsmanagementsystem.Repository.VenueRepository;
import com.example.eventsmanagementsystem.Service.Auth.UserRoleHandler;
import com.example.eventsmanagementsystem.Service.Auth.UserSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthUtil {
    private final VenueRepository venueRepository;
    private final ServiceRepository serviceRepository;
    private final EventRepository eventRepository;
    private final UserSyncService userSyncService;

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof Jwt jwt) {
                return jwt.getSubject(); 
            }
        }

        throw new RuntimeException("No authenticated user found");
    }

    public BaseRoleEntity getUser(String userId) {
        for (UserRoleHandler<?> handler : userSyncService.getHandlers()) {
            BaseRoleEntity user = handler.findUserById(userId);
            if (Objects.nonNull(user)) {
                return user;
            }
        }
        return null;
    }

    public BaseRoleEntity getProvider(Booking booking) {
        if (booking instanceof VenueBooking venueBooking) {
            return venueRepository.findById(venueBooking.getVenueId()).map(Venue::getVenueProvider).orElse(null);
        } else if (booking instanceof ServiceBooking serviceBooking) {
            return serviceRepository.findById(serviceBooking.getServiceId()).map(Services::getServiceProvider).orElse(null);
        } else if (booking instanceof EventBooking eventBooking) {
            return eventRepository.findById(eventBooking.getEventId()).map(Event::getOrganizer).orElse(null);
        }
        return null;
    }
}

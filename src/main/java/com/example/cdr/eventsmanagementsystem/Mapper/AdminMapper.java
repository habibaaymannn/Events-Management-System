package com.example.cdr.eventsmanagementsystem.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;

@Mapper(componentModel = "spring")
public interface AdminMapper {
    @Mapping(target = "role", constant = "admin")
    UserDetailsDto toUserDetails(Admin admin);

    @Mapping(target = "role", constant = "organizer")
    UserDetailsDto toUserDetails(Organizer organizer);

    @Mapping(target = "role", constant = "attendee")
    UserDetailsDto toUserDetails(Attendee attendee);

    @Mapping(target = "role", constant = "service_provider")
    UserDetailsDto toUserDetails(ServiceProvider serviceProvider);

    @Mapping(target = "role", constant = "venue_provider")
    UserDetailsDto toUserDetails(VenueProvider venueProvider);

    @Mapping(source = "organizer.id", target = "organizerId")
    @Mapping(source = "organizer", target = "organizerName", qualifiedByName = "organizerName")
    @Mapping(source = "venue.id", target = "venueId")
    @Mapping(source = "venue.name", target = "venueName")
    @Mapping(source = "venue.location", target = "venueLocation")
    EventDetailsDto toEventDetailsDto(Event event);

    default UserDetailsDto toUserDetails(BaseRoleEntity user) {
        if (user == null) return null;
        if (user instanceof Admin admin) return toUserDetails(admin);
        if (user instanceof Organizer organizer) return toUserDetails(organizer);
        if (user instanceof ServiceProvider sp) return toUserDetails(sp);
        if (user instanceof VenueProvider vp) return toUserDetails(vp);
        return toUserDetails((Attendee) user);
    }

    @Named("organizerName")
    default String organizerName(Organizer organizer) {
        if (organizer == null) return null;
        return organizer.getFirstName() + " " + organizer.getLastName();
    }
}



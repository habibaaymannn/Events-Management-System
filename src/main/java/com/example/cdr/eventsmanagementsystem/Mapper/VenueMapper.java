package com.example.cdr.eventsmanagementsystem.Mapper;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Model.Venue.VenueType;
import com.example.cdr.eventsmanagementsystem.Repository.VenueTypeRepository;
import org.mapstruct.*;
import java.util.*;

@Mapper(componentModel = "spring")
public interface VenueMapper {

    @Mapping(target = "images", ignore = true)
    @Mapping(target = "type", source = "typeId", qualifiedByName = "typeIdToType")
    Venue toVenue(VenueDTO dto, @Context VenueTypeRepository venueTypeRepository);

    @Mapping(target = "images", expression = "java(bytesToBase64(venue.getImages()))")
    @Mapping(source = "venueProvider.keycloakId", target = "venueProviderId")
    @Mapping(target = "typeId", expression = "java(venue.getType().getId())")
    @Mapping(target = "typeName", expression = "java(venue.getType().getName())")
    @Mapping(target = "supportedEventTypes", expression = "java(mapEventTypes(venue))")
    VenueDTO toVenueDTO(Venue venue);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "type", source = "typeId", qualifiedByName = "typeIdToType")
    void updateVenue(VenueDTO dto, @MappingTarget Venue venue, @Context VenueTypeRepository venueTypeRepository);

    default List<String> bytesToBase64(List<byte[]> images) {
        if (images == null) return Collections.emptyList();
        return images.stream()
                .map(img -> Base64.getEncoder().encodeToString(img))
                .toList();
    }
    @Named("typeIdToType")
    default VenueType typeIdToType(Long typeId, @Context VenueTypeRepository venueTypeRepository) {
        if (typeId == null) {
            throw new RuntimeException("TypeId is required");
        }
        return venueTypeRepository.findById(typeId).orElseThrow(() -> new RuntimeException("Venue type not found with id: " + typeId));
    }
    default List<String> mapEventTypes(Venue venue) {
        if (venue == null || venue.getType() == null || venue.getType().getEligibleEvents() == null) {
            return Collections.emptyList();
        }
        List<String> eventTypes = venue.getType().getEligibleEvents().stream()
                .map(eligibility -> eligibility.getEventType().getName())
                .toList();
        return eventTypes;
    }
}

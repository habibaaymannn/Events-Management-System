package com.example.cdr.eventsmanagementsystem.Mapper;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Type;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    @Mapping(source = "type", target = "type",  qualifiedByName = "stringToType")
    @Mapping(source = "eventTypes", target = "supportedEventTypes", qualifiedByName = "stringToEventTypes")
    Venue toVenue(VenueDTO dto);

    @Mapping(source = "venueProvider.keycloakId", target = "venueProviderId")
    @Mapping(source = "type", target = "type", qualifiedByName = "typeToString")
    @Mapping(source = "supportedEventTypes", target = "eventTypes", qualifiedByName = "eventTypesToStringList")
    VenueDTO toVenueDTO(Venue venue);

    @Mapping(target = "id", ignore = true)
    @Mapping(source = "type", target = "type", qualifiedByName = "stringToType")
    @Mapping(source = "eventTypes", target = "supportedEventTypes", qualifiedByName = "stringToEventTypes")
    void updateVenue(VenueDTO dto,@MappingTarget Venue venue);

    @Named("stringToType")
    default Type stringToType(String type) {
        if (type == null) return null;
        String normalized = type.trim().toUpperCase().replace(" ", "_");
        try {
            return Type.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            switch (normalized) {
                case "CONFERENCECENTER":
                    return Type.CONFERENCE_CENTER;
                case "SCHOOLHALL":
                    return Type.SCHOOL_HALL;
                case "UNIVERSITYAUDITORIUM":
                    return Type.UNIVERSITY_AUDITORIUM;
                case "ARTGALLERY":
                    return Type.ART_GALLERY;
                case "SPORTSARENA":
                    return Type.SPORTS_ARENA;
                default:
                    throw new IllegalArgumentException(
                            "Unsupported venue type: '" + type + "'. " +
                                    "Allowed values: " + Arrays.toString(Type.values())
                    );
            }
        }
    }
    @Named("typeToString")
    default String typeToString(Type type) {
        if (type == null) return null;
        return type.name();
    }
    @Named("stringToEventTypes")
    default Set<EventType> stringToEventTypes(List<String> eventTypes) {
        if (eventTypes == null || eventTypes.isEmpty()) {
            return new HashSet<>();
        }

        return eventTypes.stream()
                .map(String::toUpperCase)
                .map(EventType::valueOf)
                .collect(Collectors.toSet());
    }
    @Named("eventTypesToStringList")
    default List<String> eventTypesToStringList(Set<EventType> eventTypes) {
        if (eventTypes == null || eventTypes.isEmpty()) {
            return List.of();
        }
        return eventTypes.stream()
                .map(Enum::name)
                .collect(Collectors.toList());
    }

}

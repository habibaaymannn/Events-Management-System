package com.example.cdr.eventsmanagementsystem.Mapper;
import com.example.cdr.eventsmanagementsystem.DTO.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Type;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    @Mapping(source = "type", target = "type",  qualifiedByName = "stringToType")
    Venue toVenue(VenueDTO dto);

    void updateVenue(VenueDTO dto,@MappingTarget     Venue venue);

    @Named("stringToType")
    default Type stringToType(String type) {
        if (type == null) return null;
        String normalized = type.trim().toUpperCase();
        switch (normalized) {
            case "VILLA":
                return Type.Villa;
            case "CHALET":
                return Type.Chalet;
            case "SCHOOL_HALL":
            case "SCHOOLHALL":
                return Type.SchoolHall;
            default:
                throw new IllegalArgumentException("Unsupported venue type: " + type + ". Allowed: Villa, Chalet, SchoolHall");
        }
    }

}

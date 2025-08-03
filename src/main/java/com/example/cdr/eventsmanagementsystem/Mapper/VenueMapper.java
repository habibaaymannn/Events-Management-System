package com.example.cdr.eventsmanagementsystem.Mapper;
import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Type;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    @Mapping(source = "type", target = "type",  qualifiedByName = "stringToType")
    Venue toVenue(VenueDTO dto);

    @Named("stringToType")
    Type stringToType(String type);
}

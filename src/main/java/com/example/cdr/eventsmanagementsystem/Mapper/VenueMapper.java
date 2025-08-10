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

    void updateVenue(VenueDTO dto,@MappingTarget Venue venue);

    @Named("stringToType")
    Type stringToType(String type);

}

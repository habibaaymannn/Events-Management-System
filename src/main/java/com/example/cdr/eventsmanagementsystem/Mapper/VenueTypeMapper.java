package com.example.cdr.eventsmanagementsystem.Mapper;

import com.example.cdr.eventsmanagementsystem.DTO.Venue.VenueTypeDTO;
import com.example.cdr.eventsmanagementsystem.Model.Venue.VenueType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VenueTypeMapper {
    VenueTypeDTO toVenueTypeDTO(VenueType venueType);
}

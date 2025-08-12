package com.example.cdr.eventsmanagementsystem.DTO.Venue;

import com.example.cdr.eventsmanagementsystem.Model.Venue.Capacity;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Pricing;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
public class VenueDTO {
    private String name;
    private String type;
    private String availability;
    private String location;
    private Capacity capacity;
    private Pricing pricing;
    private List<String> images;
    private String venueProviderId;
}

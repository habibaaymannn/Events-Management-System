package com.example.cdr.eventsmanagementsystem.DTO;

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
    private String location;
    private Capacity capacity;
    private Pricing pricing;
    private List<String> images;
    private Long venueProviderId;
}

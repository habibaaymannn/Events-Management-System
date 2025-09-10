package com.example.cdr.eventsmanagementsystem.DTO.Venue;

import com.example.cdr.eventsmanagementsystem.Model.Venue.Capacity;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Pricing;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
public class VenueDTO {

    private Long id;
    @NotBlank(message = "Venue name is required")
    private String name;
    @NotBlank(message = "Type is required")
    private String type;
    @NotBlank(message = "Availability is required")
    private String availability;
    @NotBlank(message = "Location is required")
    private String location;
    @NotNull(message = "Capacity is required")
    private Capacity capacity;
    @NotNull(message = "Pricing is required")
    private Pricing pricing;
    private List<String> images;
    @Size(min = 1, message = "At least one event type is required")
    private List<String> eventTypes;
    private String venueProviderId;
}

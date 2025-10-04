package com.example.cdr.eventsmanagementsystem.DTO.Service;

import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Service.Availability;
import com.example.cdr.eventsmanagementsystem.Model.Service.ServiceType;
import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServicesDTO {
    private Long id;

    @NotBlank(message = "Service name is required")
    private String name;

    @NotNull(message = "Service type is required")
    @JsonAlias({"serviceType", "type"})
    private ServiceType type;

     private String description;

    @NotNull(message = "Price is required")
    private Double price;

    @NotNull(message = "Location is required")
    @JsonAlias({"serviceAreas", "servicesAreas"})
    private List<String> servicesAreas;

    @NotNull(message = "Availability is required")
    private Availability availability;

    private String serviceProviderId;

    private List<String> images;
}

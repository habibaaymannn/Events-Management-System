package com.example.cdr.eventsmanagementsystem.DTO.Service;

import com.example.cdr.eventsmanagementsystem.Model.Service.Availability;
import com.example.cdr.eventsmanagementsystem.Model.Service.ServiceType;
import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ServicesDTO {
    private Long id;

    @NotBlank(message = "Service name is required")
    private String name;

    @NotNull(message = "Service type is required")
    @JsonAlias({"serviceType", "type"})
    private ServiceType type;

    // @NotBlank(message = "Description is required")
    // private String description;

    @NotNull(message = "Price is required")
    private Double price;

    @NotNull(message = "Location is required")
    @JsonAlias({"serviceAreas", "servicesAreas"})
    private List<String> servicesAreas;

    @NotNull(message = "Availability is required")
    private Availability availability;

    private String serviceProviderId;
}

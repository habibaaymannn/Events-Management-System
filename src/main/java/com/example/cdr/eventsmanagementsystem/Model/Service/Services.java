package com.example.cdr.eventsmanagementsystem.Model.Service;

import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Util.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "services")
public class Services extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType type;

    @Column(nullable = true)
    private String description;

    @Column(nullable = false)
    private Double price;

    @ElementCollection
    @CollectionTable(name = "services_areas", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "services_area", nullable = false)
    private List<String> servicesAreas = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Availability availability;

    @ManyToOne
    @JoinColumn(name = "service_provider_id", nullable = false)
    private ServiceProvider serviceProvider;
}

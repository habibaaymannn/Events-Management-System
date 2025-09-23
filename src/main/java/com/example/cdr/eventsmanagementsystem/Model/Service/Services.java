package com.example.cdr.eventsmanagementsystem.Model.Service;

import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Util.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@SQLDelete(sql = "UPDATE services SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
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

    @Column(nullable = false)
    private boolean deleted;
}

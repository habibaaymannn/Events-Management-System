package com.example.cdr.eventsmanagementsystem.Model.User;

import java.util.ArrayList;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Service.Service;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "service_providers")
public class ServiceProvider extends BaseRoleEntity {
    @OneToMany(mappedBy = "serviceProvider")
    private List<Service> services = new ArrayList<>();
}

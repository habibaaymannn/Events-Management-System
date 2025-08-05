package com.example.cdr.eventsmanagementsystem.Model.User;

import java.util.ArrayList;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Service.Service;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "service_providers")
public class ServiceProvider extends BaseRoleEntity {
    @OneToMany(mappedBy = "provider")
    private List<Service> services = new ArrayList<>();
}

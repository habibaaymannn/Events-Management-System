package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Services, Long> {
    List<Services> findByServiceProviderId(String providerId);
    Optional<Services> findByNameAndServiceProviderId(String name, String providerId);

}

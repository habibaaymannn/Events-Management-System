package com.example.cdr.eventsmanagementsystem.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ServiceRepository extends JpaRepository<Services, Long> {
    Page<Services> findByServiceProvider(ServiceProvider serviceProvider, Pageable pageable);
}

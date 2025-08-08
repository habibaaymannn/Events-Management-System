package com.example.cdr.eventsmanagementsystem.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.Model.Service.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

}

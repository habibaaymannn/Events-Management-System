package com.example.eventsmanagementsystem.Repository;

import com.example.eventsmanagementsystem.Model.Service.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ServiceRepository extends JpaRepository<Services, Long> {

}

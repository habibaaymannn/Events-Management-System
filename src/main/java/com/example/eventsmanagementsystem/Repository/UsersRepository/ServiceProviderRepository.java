package com.example.eventsmanagementsystem.Repository.UsersRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.eventsmanagementsystem.Model.User.ServiceProvider;

import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, String> {
    @Query("select count(distinct s.serviceProvider.id) from ServiceBooking b join Services s on b.serviceId = s.id where b.status = 'BOOKED'")
    long countDistinctBookedProviders();

    Optional<ServiceProvider> findByEmail(String email);
}

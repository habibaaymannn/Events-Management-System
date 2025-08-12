package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, String> {
    @Query("select count(distinct s.serviceProvider.id) from Booking b join b.service s where b.service is not null and b.status = 'BOOKED'")
    long countDistinctBookedProviders();
}

package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, String> {
    boolean existsByEmail(String email);

}

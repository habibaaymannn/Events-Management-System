package com.example.cdr.eventsmanagementsystem.Repository.UsersRepository;

import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendeeRepository extends JpaRepository<Attendee, String> {
    boolean existsByEmail(String email);

}

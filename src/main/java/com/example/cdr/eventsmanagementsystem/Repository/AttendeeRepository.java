package com.example.cdr.eventsmanagementsystem.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;

@Repository
public interface AttendeeRepository extends JpaRepository<Attendee, String> {

}

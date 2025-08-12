package com.example.cdr.eventsmanagementsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
public class EventsManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventsManagementSystemApplication.class, args);
    }

}

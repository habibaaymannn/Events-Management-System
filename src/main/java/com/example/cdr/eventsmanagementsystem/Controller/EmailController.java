package com.example.cdr.eventsmanagementsystem.Controller;

import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import com.example.cdr.eventsmanagementsystem.Repository.Venue.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Venue.Notifications.EmailNotifications;
import com.example.cdr.eventsmanagementsystem.Service.Venue.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class EmailController {
    private final EmailNotifications emailNotifications;
    private final VenueService venueService;
    private final VenueRepository venueRepository;


}

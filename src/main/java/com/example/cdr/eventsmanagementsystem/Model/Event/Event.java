package com.example.cdr.eventsmanagementsystem.Model.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import static jakarta.persistence.GenerationType.IDENTITY;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private EventType type;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.DRAFT;
    
    @CreatedBy
    private String createdBy;
    
    @LastModifiedBy
    private String lastModifiedBy;
    
    @CreatedDate
    private LocalDateTime createdDate;
    
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
    
    @ManyToOne
    @Column(nullable = false)
    private Organizer organizer;

    @ManyToOne
    @Column(nullable = false)
    private Venue venue;

    @OneToMany(mappedBy = "event")
    private List<Booking> bookings = new ArrayList<>();

    private LocalDateTime freeCancellationDeadline;  
    private BigDecimal retailPrice; 
}

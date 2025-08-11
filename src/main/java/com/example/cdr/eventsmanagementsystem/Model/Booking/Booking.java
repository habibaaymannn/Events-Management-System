package com.example.cdr.eventsmanagementsystem.Model.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingType type;

    @ManyToOne
    @JsonIgnore
    private Venue venue;

    @ManyToOne
    @JsonIgnore
    private Event event;

    @ManyToOne
    @JsonIgnore
    private Services service;

    @Column(name = "booker_id", nullable = false)
    private String bookerId;  // Keycloak ID

    @Enumerated(EnumType.STRING)
    @Column(name = "booker_type", nullable = false)  
    private BookerType bookerType; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Column(unique = true)
    private String stripePaymentId;
    private BigDecimal refundAmount;
    private LocalDateTime refundProcessedAt;

    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String cancelledBy; 

    @CreatedDate 
    private LocalDateTime createdAt;
    @LastModifiedDate 
    private LocalDateTime updatedAt;
    @CreatedBy 
    private String createdBy;
    @LastModifiedBy 
    private String lastModifiedBy;

    public void setAttendeeBooker(Attendee attendee) {
        this.bookerId = attendee.getId();
        this.bookerType = BookerType.ATTENDEE;
    }

    public void setOrganizerBooker(Organizer organizer) {
        this.bookerId = organizer.getId();
        this.bookerType = BookerType.ORGANIZER;
    }

    public void setBooker(BaseRoleEntity user, BookerType type) {
        this.bookerId = user.getId();
        this.bookerType = type;
    }
}

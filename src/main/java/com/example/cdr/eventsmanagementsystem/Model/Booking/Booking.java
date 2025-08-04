package com.example.cdr.eventsmanagementsystem.Model.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Service.Service;
import com.example.cdr.eventsmanagementsystem.Model.User.User;
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
    private Venue venue;

    @ManyToOne
    private Event event;

    @ManyToOne
    private Service service;

    @ManyToOne
    @Column(nullable = false)
    private User booker; 

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
}

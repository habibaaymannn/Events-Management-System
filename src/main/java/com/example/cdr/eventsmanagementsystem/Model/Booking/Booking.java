package com.example.cdr.eventsmanagementsystem.Model.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import com.example.cdr.eventsmanagementsystem.Model.Venue.Venue;
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
    private Services service;

//    @ManyToOne
//    @JoinColumn(name = "booker_id", nullable = false)
//    private Attendee booker;

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

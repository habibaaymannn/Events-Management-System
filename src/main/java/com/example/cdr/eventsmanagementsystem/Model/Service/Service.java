package com.example.cdr.eventsmanagementsystem.Model.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import static jakarta.persistence.GenerationType.IDENTITY;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "services")
public class Service {
    @Id 
    @GeneratedValue(strategy = IDENTITY)
    private Long id;
    
    private String name;  
    private BigDecimal basePrice;
    
    @ManyToOne(optional = false)
    private ServiceProvider provider;

    @OneToMany(mappedBy = "service")
    private List<Booking> bookings = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;
}

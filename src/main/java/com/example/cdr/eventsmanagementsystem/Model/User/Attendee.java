package com.example.cdr.eventsmanagementsystem.Model.User;

import java.util.ArrayList;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true) 
@Table(name = "attendees")
public class Attendee extends BaseRoleEntity {
    @OneToMany(mappedBy = "booker")
    private List<Booking> bookings = new ArrayList<>();
}

package com.example.cdr.eventsmanagementsystem.Model.User;

import java.util.ArrayList;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "attendees")
public class Attendee extends User {
//    @OneToMany(mappedBy = "booker")
//    private List<Booking> bookings = new ArrayList<>();
}
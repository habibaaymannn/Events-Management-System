package com.example.cdr.eventsmanagementsystem.Model.Event;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "event_type")
public class EventType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
}

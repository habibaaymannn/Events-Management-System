package com.example.eventsmanagementsystem.Model.Venue;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Embeddable
public class Capacity {
    private int minCapacity;
    private int maxCapacity;
}

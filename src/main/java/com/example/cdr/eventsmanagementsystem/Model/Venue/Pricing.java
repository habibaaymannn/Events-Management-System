package com.example.cdr.eventsmanagementsystem.Model.Venue;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Embeddable
public class Pricing {
    private float perHour;
    private float perEvent;
}

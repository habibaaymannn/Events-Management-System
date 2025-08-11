package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import java.util.List;

import lombok.Data;

@Data
public class CombinedBookingRequest extends BaseBookingDTO {
    private String organizerId;
    
    private Long venueId;
    
    private List<Long> serviceIds;
    
}

package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class CombinedBookingResponse {
    private Long venueBookingId;
    private List<Long> serviceBookingIds;
    private String organizerId;
        private String paymentUrl; 
}

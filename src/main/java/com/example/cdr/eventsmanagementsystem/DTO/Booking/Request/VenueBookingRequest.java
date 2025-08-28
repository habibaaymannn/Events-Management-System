package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;

@Data
public class VenueBookingRequest extends BaseBookingDTO {
    private Long venueId;
    
    // private String organizerId; 
    
    private Long eventId;  

    // private PaymentDetailsDTO paymentDetails;
}

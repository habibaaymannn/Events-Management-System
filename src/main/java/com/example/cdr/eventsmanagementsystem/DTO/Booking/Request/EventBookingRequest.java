package com.example.cdr.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;

@Data
public class EventBookingRequest extends BaseBookingDTO {    
    protected Long eventId;

    private Integer ticketQuantity = 1;
}

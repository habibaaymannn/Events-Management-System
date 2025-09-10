package com.example.eventsmanagementsystem.DTO.Booking.Request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class EventBookingRequest extends BaseBookingDTO {
    protected Long eventId;
}

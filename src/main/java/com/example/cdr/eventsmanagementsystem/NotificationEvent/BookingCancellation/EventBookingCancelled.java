package com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.cdr.eventsmanagementsystem.Model.Booking.EventBooking;

public record EventBookingCancelled(EventBooking booking, String reason) {
}

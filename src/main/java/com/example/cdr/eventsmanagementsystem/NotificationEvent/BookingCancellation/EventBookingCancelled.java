package com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

public record EventBookingCancelled(Booking booking, String reason) {
}

package com.example.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.eventsmanagementsystem.Model.Booking.EventBooking;

public record EventBookingCancelled(EventBooking booking, String reason) {
}

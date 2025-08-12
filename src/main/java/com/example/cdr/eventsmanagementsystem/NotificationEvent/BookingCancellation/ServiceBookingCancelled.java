package com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

public record ServiceBookingCancelled(Booking booking, String reason){}

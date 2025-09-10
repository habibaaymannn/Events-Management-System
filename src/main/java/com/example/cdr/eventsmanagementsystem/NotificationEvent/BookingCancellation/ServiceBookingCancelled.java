package com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.cdr.eventsmanagementsystem.Model.Booking.ServiceBooking;

public record ServiceBookingCancelled(ServiceBooking booking, String reason){}

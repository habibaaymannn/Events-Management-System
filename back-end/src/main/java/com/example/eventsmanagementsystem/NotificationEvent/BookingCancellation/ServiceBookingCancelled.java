package com.example.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.eventsmanagementsystem.Model.Booking.ServiceBooking;

public record ServiceBookingCancelled(ServiceBooking booking, String reason){}

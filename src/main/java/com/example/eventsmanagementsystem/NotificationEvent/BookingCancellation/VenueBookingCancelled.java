package com.example.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.eventsmanagementsystem.Model.Booking.VenueBooking;

public record VenueBookingCancelled(VenueBooking booking, String reason) {}

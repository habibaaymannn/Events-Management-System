package com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCancellation;

import com.example.cdr.eventsmanagementsystem.Model.Booking.VenueBooking;

public record VenueBookingCancelled(VenueBooking booking, String reason) {}

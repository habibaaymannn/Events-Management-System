package com.example.cdr.eventsmanagementsystem.NotificationEvent.BookingCreation;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

public record VenueBookingCreated(Booking booking, String checkoutUrl) {}

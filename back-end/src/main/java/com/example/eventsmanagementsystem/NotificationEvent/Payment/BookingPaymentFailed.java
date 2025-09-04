package com.example.eventsmanagementsystem.NotificationEvent.Payment;

import com.example.eventsmanagementsystem.Model.Booking.Booking;

public record BookingPaymentFailed(Booking booking, String failureReason) {}

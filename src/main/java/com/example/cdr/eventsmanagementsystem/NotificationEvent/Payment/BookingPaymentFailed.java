package com.example.cdr.eventsmanagementsystem.NotificationEvent.Payment;

import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;

public record BookingPaymentFailed(Booking booking, String failureReason) {}

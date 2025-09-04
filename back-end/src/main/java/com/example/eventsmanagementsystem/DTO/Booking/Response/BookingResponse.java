package com.example.eventsmanagementsystem.DTO.Booking.Response;

import java.time.LocalDateTime;

import com.example.eventsmanagementsystem.DTO.Booking.Request.BaseBookingDTO;
import com.example.eventsmanagementsystem.Model.Booking.BookingStatus;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BookingResponse extends BaseBookingDTO {
    private BookingStatus status;
    private String paymentUrl;

    private String stripePaymentId;
    private LocalDateTime refundProcessedAt;

    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
}
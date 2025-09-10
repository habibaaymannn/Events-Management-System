package com.example.cdr.eventsmanagementsystem.DTO.Booking.Response;

import java.time.LocalDateTime;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BaseBookingDTO;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BookingResponse extends BaseBookingDTO {

    private Long id;
    private BookingStatus status;
    private String paymentUrl;

    private String stripePaymentId;
    private LocalDateTime refundProcessedAt;

    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
}
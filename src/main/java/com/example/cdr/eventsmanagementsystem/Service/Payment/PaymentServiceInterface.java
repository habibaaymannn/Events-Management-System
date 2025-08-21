package com.example.cdr.eventsmanagementsystem.Service.Payment;

import java.math.BigDecimal;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.CheckoutSessionResponse;

public interface PaymentServiceInterface {
    BookingDetailsResponse captureBookingPayment(Long bookingId, BigDecimal amountToCapture);
    BookingDetailsResponse voidBookingPayment(Long bookingId, String reason);
    BookingDetailsResponse refundBookingPayment(Long bookingId, BigDecimal amount, String reason);
    BookingDetailsResponse confirmCheckoutSession(String sessionId);

    CheckoutSessionResponse createSetupCheckoutSessionForCurrentUser();
    void setDefaultPaymentMethodForCurrentUser(String paymentMethodId);
}



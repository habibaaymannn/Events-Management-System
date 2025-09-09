package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;

import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.SetupIntent;
import com.stripe.model.checkout.Session;

public interface StripeServiceInterface {
    Customer createCustomer(String email, String name, String phone);
    PaymentIntent retrievePaymentIntent(String paymentIntentId);
    Refund createRefund(String paymentIntentId, BigDecimal amount, String reason);
    PaymentIntent capturePaymentIntent(String paymentIntentId, BigDecimal amountToCapture);
    PaymentIntent cancelPaymentIntent(String paymentIntentId, String cancellationReason);
    void attachPaymentMethodToCustomer(String paymentMethodId, String customerId);
    PaymentIntent createManualCapturePaymentIntent(BigDecimal amount, String currency, String customerId, String description);
    Session createCheckoutSession(String customerId, BigDecimal amount, String currency, String name, Long bookingId, String setupFutureUsage, boolean manualCapture, BookingType bookingType);
    Session createSetupSession(String customerId, String userId);
    Session retrieveSession(String sessionId);
}

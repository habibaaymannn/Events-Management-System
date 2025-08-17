package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;

import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;

public interface StripeServiceInterface {
    PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String customerId, String description);
    
    PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId);
    Customer createCustomer(String email, String name, String phone);
    PaymentIntent retrievePaymentIntent(String paymentIntentId);
    Refund createRefund(String paymentIntentId, BigDecimal amount, String reason);
}

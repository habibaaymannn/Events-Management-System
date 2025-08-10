package com.example.cdr.eventsmanagementsystem.Service.Booking;

import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.Customer;

import java.math.BigDecimal;

public interface IStripeService {
    PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String customerId, String description);
    
    PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId);
    
    PaymentIntent retrievePaymentIntent(String paymentIntentId);
    
    Customer createCustomer(String email, String name, String phone);
    
    Customer retrieveCustomer(String customerId);
    
    Refund createRefund(String paymentIntentId, BigDecimal amount, String reason);

}

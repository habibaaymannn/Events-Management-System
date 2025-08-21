package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;

import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.SetupIntent;
import com.stripe.model.checkout.Session;

public interface StripeServiceInterface {
    PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String customerId, String description);
    
    PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId);
    Customer createCustomer(String email, String name, String phone);
    PaymentIntent retrievePaymentIntent(String paymentIntentId);
    Refund createRefund(String paymentIntentId, BigDecimal amount, String reason);

    PaymentIntent authorizePayment(BigDecimal amount, String currency, String customerId, String description, String paymentMethodId, boolean captureLater);
    PaymentIntent capturePayment(String paymentIntentId, BigDecimal amountToCapture);
    PaymentIntent cancelPaymentIntent(String paymentIntentId, String cancellationReason);
    PaymentIntent voidPayment(String paymentIntentId);

    PaymentIntent createPaymentWithSavedCard(BigDecimal amount, String currency, String customerId, String paymentMethodId, String description, boolean authorizeOnly);

    SetupIntent createSetupIntent(String customerId);

    Session createCheckoutSessionForPayment(BigDecimal amount, String currency, String customerId, String description, String bookingId, boolean authorizeOnly, String successUrl, String cancelUrl);
    Session createCheckoutSessionForSetup(String customerId, String successUrl, String cancelUrl);
    Session retrieveCheckoutSession(String sessionId);

    Session createCheckoutSessionUsingUser(BigDecimal amount, String currency, BaseRoleEntity user, String description, String referenceId, boolean authorizeOnly, String successUrl, String cancelUrl);
    Session createSetupCheckoutSessionForUser(BaseRoleEntity user, String successUrl, String cancelUrl);
}

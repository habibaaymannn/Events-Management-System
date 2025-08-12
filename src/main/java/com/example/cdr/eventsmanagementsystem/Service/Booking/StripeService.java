package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class StripeService implements IStripeService {
    
    @Value("${spring.stripe.api-key}")
    private String stripeApiKey;
    
    @Value("${app.payment.return-url}")
    private String paymentReturnUrl;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Override
    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String customerId, String description) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(toCents(amount)) 
                    .setCurrency(currency)
                    .setCustomer(customerId)
                    .setDescription(description)
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER) 
                            .build()
                    )
                    .build();

            return PaymentIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent", e);
        }
    }

    @Override
    public PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            
            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod(paymentMethodId)
                    .setReturnUrl(paymentReturnUrl)
                    .build();

            return intent.confirm(confirmParams);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to confirm payment intent", e);
        }
    }

    @Override
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) {
        try {
            return PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to retrieve payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public Customer createCustomer(String email, String name, String phone) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("email", email);
            
            if (name != null) {
                params.put("name", name);
            }
            
            if (phone != null) {
                params.put("phone", phone);
            }
                        
            return Customer.create(params);
            
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create customer: " + e.getMessage(), e);
        }
    }

    @Override
    public Refund createRefund(String paymentIntentId, BigDecimal amount, String reason) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("payment_intent", paymentIntentId);
            
            if (amount != null) {
                params.put("amount", toCents(amount));
            }
            
            String normalizedReason = normalizeRefundReason(reason);
            params.put("reason", normalizedReason);

            return Refund.create(params);

        } catch (StripeException e) {
            throw new RuntimeException("Failed to create refund: " + e.getMessage(), e);
        }
    }

    private String normalizeRefundReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return "requested_by_customer";
        }
        String r = reason.trim().toLowerCase().replace(' ', '_');
        if (r.equals("requested_by_customer") || r.equals("duplicate") || r.equals("fraudulent")) {
            return r;
        }
        return "requested_by_customer";
    }


    private long toCents(BigDecimal amount) {
        return amount.multiply(new BigDecimal("100")).longValue();
    }
}

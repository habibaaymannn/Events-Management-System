package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.example.cdr.eventsmanagementsystem.Constants.RefundConstants;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCaptureParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService implements StripeServiceInterface {
    
    @Value("${spring.stripe.api-key}")
    private String stripeApiKey;
    
    @Value("${app.payment.return-url}")
    private String paymentReturnUrl;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Override
    public PaymentIntent createManualCapturePaymentIntent(BigDecimal amount, String currency, String customerId, String description) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(toCents(amount))
                    .setCurrency(currency)
                    .setCustomer(customerId)
                    .setDescription(description)
                    .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.MANUAL)
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                            .build()
                    )
                    .build();

            return PaymentIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create manual capture payment intent: " + e.getMessage(), e);
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
            
            String normalizedReason = reason.trim().toLowerCase().replace(' ', '_');
            if (normalizedReason.equals(RefundConstants.DUPLICATE) ||
                normalizedReason.equals(RefundConstants.FRAUDULENT) ||
                normalizedReason.equals(RefundConstants.REQUESTED_BY_CUSTOMER)) {
                params.put("reason", normalizedReason);
            } else {
                throw new IllegalArgumentException("Invalid refund reason: " + reason +
                    ". Allowed values are: " + RefundConstants.DUPLICATE + 
                    ", " + RefundConstants.FRAUDULENT + 
                    ", " + RefundConstants.REQUESTED_BY_CUSTOMER + ".");
            }

            return Refund.create(params);

        } catch (StripeException e) {
            throw new RuntimeException("Failed to create refund: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentIntent capturePaymentIntent(String paymentIntentId, BigDecimal amountToCapture) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            PaymentIntentCaptureParams params = PaymentIntentCaptureParams.builder()
                .setAmountToCapture(amountToCapture != null ? toCents(amountToCapture) : null)
                .build();
            return intent.capture(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to capture payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentIntent cancelPaymentIntent(String paymentIntentId, String cancellationReason) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            Map<String, Object> params = new HashMap<>();
            if (cancellationReason != null && !cancellationReason.isBlank()) {
                params.put("cancellation_reason", cancellationReason);
            }
            return intent.cancel(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to cancel payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public void attachPaymentMethodToCustomer(String paymentMethodId, String customerId) {
        try {
            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            PaymentMethodAttachParams params = PaymentMethodAttachParams.builder()
                .setCustomer(customerId)
                .build();
            paymentMethod.attach(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to attach payment method: " + e.getMessage(), e);
        }
    }

    @Override
    public Session createCheckoutSession(String customerId, BigDecimal amount, String currency, String name, Long bookingId, String setupFutureUsage, boolean manualCapture) {
        try {
            ProductData product = ProductData.builder()
                .setName(name)
                .build();

            PriceData priceData = PriceData.builder()
                .setCurrency(currency)
                .setUnitAmount(toCents(amount))
                .setProductData(product)
                .build();

            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(priceData)
                .build();

            Map<String, String> metadata = new HashMap<>();
            metadata.put("bookingId", String.valueOf(bookingId));

            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomer(customerId)
                .setSuccessUrl(paymentReturnUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(paymentReturnUrl + "?canceled=true")
                .addLineItem(lineItem)
                .putAllMetadata(metadata);

            if (setupFutureUsage != null) {
                builder.setPaymentIntentData(
                    SessionCreateParams.PaymentIntentData.builder() 
                        .setSetupFutureUsage(SessionCreateParams.PaymentIntentData.SetupFutureUsage.valueOf(setupFutureUsage))
                        .setCaptureMethod(manualCapture ? SessionCreateParams.PaymentIntentData.CaptureMethod.MANUAL : SessionCreateParams.PaymentIntentData.CaptureMethod.AUTOMATIC)
                        .build()
                );
            }

            return Session.create(builder.build());
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create checkout session", e);
        }
    }

    @Override
    public Session createSetupSession(String customerId, String userId) {
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("userId", userId);

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SETUP)
                .setCustomer(customerId)
                .setSuccessUrl(paymentReturnUrl + "?setup_session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(paymentReturnUrl + "?setup_canceled=true")
                .putAllMetadata(metadata)
                .build();

            return Session.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create setup session", e);
        }
    }

    @Override
    public Session retrieveSession(String sessionId) {
        try {
            return Session.retrieve(sessionId);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to retrieve session: " + sessionId, e);
        }
    }

    private long toCents(BigDecimal amount) {
        return amount.multiply(new BigDecimal("100")).longValue();
    }
}

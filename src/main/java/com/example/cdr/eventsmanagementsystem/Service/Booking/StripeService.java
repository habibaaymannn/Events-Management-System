package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.SetupIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCaptureParams;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.SetupIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@lombok.RequiredArgsConstructor
public class StripeService implements StripeServiceInterface {
    
    @Value("${spring.stripe.api-key}")
    private String stripeApiKey;
    
    @Value("${app.payment.return-url}")
    private String paymentReturnUrl;
    private final UserSyncService userSyncService;
    
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
            RefundCreateParams.Builder builder = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId);
            
            if (amount != null) {
                builder.setAmount(toCents(amount));
            }
            
            String normalizedReason = normalizeRefundReason(reason);
            builder.setReason(RefundCreateParams.Reason.valueOf(normalizedReason.toUpperCase()));

            return Refund.create(builder.build());

        } catch (StripeException e) {
            throw new RuntimeException("Failed to create refund: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentIntent authorizePayment(BigDecimal amount, String currency, String customerId, String description, String paymentMethodId, boolean captureLater) {
        try {
            PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
                    .setAmount(toCents(amount))
                    .setCurrency(currency)
                    .setCustomer(customerId)
                    .setDescription(description)
                    .setCaptureMethod(captureLater ? PaymentIntentCreateParams.CaptureMethod.MANUAL : PaymentIntentCreateParams.CaptureMethod.AUTOMATIC)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                    .build()
                    );

            if (paymentMethodId != null) {
                builder.setPaymentMethod(paymentMethodId);
                builder.setConfirm(true);
            }

            PaymentIntentCreateParams params = builder.build();
            return PaymentIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to authorize payment", e);
        }
    }

    @Override
    public PaymentIntent capturePayment(String paymentIntentId, BigDecimal amountToCapture) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            PaymentIntentCaptureParams.Builder builder = PaymentIntentCaptureParams.builder();
            if (amountToCapture != null) {
                builder.setAmountToCapture(toCents(amountToCapture));
            }
            return intent.capture(builder.build());
        } catch (StripeException e) {
            throw new RuntimeException("Failed to capture payment", e);
        }
    }

    @Override
    public PaymentIntent cancelPaymentIntent(String paymentIntentId, String cancellationReason) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            Map<String, Object> params = new HashMap<>();
            if (cancellationReason != null) {
                params.put("cancellation_reason", cancellationReason);
            }
            return intent.cancel(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to cancel payment intent", e);
        }
    }

    @Override
    public PaymentIntent voidPayment(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            if ("requires_capture".equals(intent.getStatus())) {
                return intent.cancel();
            } else {
                throw new RuntimeException("Payment cannot be voided. Current status: " + intent.getStatus());
            }
        } catch (StripeException e) {
            throw new RuntimeException("Failed to void payment", e);
        }
    }

    @Override
    public PaymentIntent createPaymentWithSavedCard(BigDecimal amount, String currency, String customerId, String paymentMethodId, String description, boolean authorizeOnly) {
        try {
            PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
                    .setAmount(toCents(amount))
                    .setCurrency(currency)
                    .setCustomer(customerId)
                    .setPaymentMethod(paymentMethodId)
                    .setDescription(description)
                    .setConfirm(true)
                    .setOffSession(true) // Indicates this is for a saved card
                    .setCaptureMethod(authorizeOnly ? PaymentIntentCreateParams.CaptureMethod.MANUAL : PaymentIntentCreateParams.CaptureMethod.AUTOMATIC);

            return PaymentIntent.create(builder.build());
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment with saved card", e);
        }
    }

    @Override
    public SetupIntent createSetupIntent(String customerId) {
        try {
            SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                    .setCustomer(customerId)
                    .setUsage(SetupIntentCreateParams.Usage.OFF_SESSION)
                    .build();
            return SetupIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create setup intent", e);
        }
    }

    @Override
    public Session createCheckoutSessionForPayment(BigDecimal amount, String currency, String customerId, String description, String bookingId, boolean authorizeOnly, String successUrl, String cancelUrl) {
        try {
            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .setCustomer(customerId)
                    .putMetadata("booking_id", bookingId)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency(currency)
                                                    .setUnitAmount(toCents(amount))
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(description)
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    );

            if (authorizeOnly) {
                builder.setPaymentIntentData(
                        SessionCreateParams.PaymentIntentData.builder()
                                .setCaptureMethod(SessionCreateParams.PaymentIntentData.CaptureMethod.MANUAL)
                                .build()
                );
            }

            return Session.create(builder.build());
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create checkout session", e);
        }
    }

    @Override
    public Session createCheckoutSessionForSetup(String customerId, String successUrl, String cancelUrl) {
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SETUP)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .setCustomer(customerId)
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .build();
            return Session.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create checkout setup session", e);
        }
    }

    @Override
    public Session retrieveCheckoutSession(String sessionId) {
        try {
            return Session.retrieve(sessionId);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to retrieve session", e);
        }
    }

    @Override
    public Session createCheckoutSessionUsingUser(BigDecimal amount, String currency, BaseRoleEntity user, String description, String referenceId, boolean authorizeOnly, String successUrl, String cancelUrl) {
        String customerId = ensureStripeCustomerId(user);
        return createCheckoutSessionForPayment(amount, currency, customerId, description, referenceId, authorizeOnly, successUrl, cancelUrl);
    }

    @Override
    public Session createSetupCheckoutSessionForUser(BaseRoleEntity user, String successUrl, String cancelUrl) {
        String customerId = ensureStripeCustomerId(user);
        return createCheckoutSessionForSetup(customerId, successUrl, cancelUrl);
    }

    private String ensureStripeCustomerId(BaseRoleEntity user) {
        if (user.getStripeCustomerId() != null && !user.getStripeCustomerId().isBlank()) {
            return user.getStripeCustomerId();
        }
        Customer customer = createCustomer(user.getEmail(), user.getFullName(), null);
        user.setStripeCustomerId(customer.getId());
        String role = userSyncService.getCurrentUserRole(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
        userSyncService.getHandlerForRole(role).saveUser(user);
        return customer.getId();
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

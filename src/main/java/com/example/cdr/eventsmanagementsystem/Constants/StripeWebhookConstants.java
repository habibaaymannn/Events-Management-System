package com.example.cdr.eventsmanagementsystem.Constants;

public class StripeWebhookConstants {
    private StripeWebhookConstants() {}

    public static final String CHECKOUT_SESSION_COMPLETED = "checkout.session.completed";
    public static final String CHECKOUT_SESSION_EXPIRED = "checkout.session.expired";
    public static final String PAYMENT_INTENT_SUCCEEDED = "payment_intent.succeeded";
    
    public static final String PAYMENT_INTENT_PAYMENT_FAILED = "payment_intent.payment_failed";
    public static final String PAYMENT_INTENT_CANCELED = "payment_intent.canceled";
    public static final String PAYMENT_INTENT_REQUIRES_ACTION = "payment_intent.requires_action";

    public static final String PAYMENT_INTENT_CREATED = "payment_intent.created";
    public static final String CHARGE_SUCCEEDED = "charge.succeeded";
    public static final String PAYMENT_METHOD_ATTACHED = "payment_method.attached";

    public static final String STRIPE_WEBHOOK_URL = "/stripe/webhook";
}

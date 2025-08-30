package com.example.cdr.eventsmanagementsystem.Constants;

public final class PaymentConstants {

    private PaymentConstants() {}



    public static final String CHECKOUT_SESSION_COMPLETED = "checkout.session.completed";
    public static final String PAYMENT_INTENT_SUCCEEDED = "payment_intent.succeeded";

    public static final String SETUP_FUTURE_USAGE_ON_SESSION = "ON_SESSION";

    public static final String REQUESTED_BY_CUSTOMER = "requested_by_customer";

    public static final String AUTHORIZE_PAYMENT = "/{bookingId}/authorize";
    public static final String CAPTURE_PAYMENT = "/{bookingId}/capture";
    public static final String VOID_PAYMENT = "/{bookingId}/void";
    public static final String REFUND_PAYMENT = "/{bookingId}/refund";

    public static final String SETUP_SESSION = "/methods/setup-session";
    public static final String DEFAULT_PAYMENT_METHOD = "/methods/default";
    public static final String AUTO_PAY = "/auto-pay";

    public static final String PAYMENT_BASE_URL = "/v1/payments";
    public static final String PAYMENT_CONFIRM = "/confirm";

    public static final String STRIPE_WEBHOOK_URL = "/stripe/webhook";
}



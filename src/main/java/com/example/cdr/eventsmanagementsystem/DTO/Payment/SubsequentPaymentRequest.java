package com.example.cdr.eventsmanagementsystem.DTO.Payment;

/**
 * This class is used to send a request for follow-up actions on an existing payment.
 * <p>
 * These actions include capturing, canceling, or refunding a payment.
 * It contains basic payment details such as the payment reference, amount, and provider.
 * </p>
 *
 * Example:
 * <pre>
 * {
 *   "referenceId": "txn_123456789",
 *   "amount": 2500,
 *   "currency": "USD",
 *   "provider": "STRIPE"
 * }
 * </pre>
 *
 * @param referenceId A unique ID that refers to the original payment (used to find the payment)
 * @param amount      The amount to process in this step (like capture or refund), in minor units (e.g., 2500 = $25.00)
 * @param currency    The 3-letter currency code, such as USD, EUR, or EGP
 * @param provider    The payment service being used (e.g., STRIPE, ADYEN, PAYPAL)
 */
public record SubsequentPaymentRequest(
        String referenceId,
        Long amount,
        String currency,
        String provider
) {}
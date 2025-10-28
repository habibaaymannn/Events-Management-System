package com.example.cdr.eventsmanagementsystem.DTO.Payment;

import java.math.BigDecimal;
import java.util.Map;

/**
 * This class is used to send the first payment request.
 * <p>
 * It includes information like amount, currency, provider, and customer details.
 * This data is usually sent from the frontend (web or mobile app) to the backend.
 * </p>
 *
 * Example:
 * <pre>
 * {
 *   "amount": 5000,
 *   "currency": "USD",
 *   "provider": "STRIPE",
 *   "description": "Payment for order #123",
 *   "quantity": 2,
 *   "name": "Alice Smith",
 *   "email": "alice@example.com",
 *   "id": "optional-transaction-id"
 * }
 * </pre>
 *
 * @param amount      The payment amount in small units (like cents). Example: 5000 means $50.00
 * @param currency    The 3-letter currency code (like USD, EUR, EGP)
 * @param provider    The payment service to use. Example: STRIPE, ADYEN, PAYPAL
 * @param description A short message or reason for the payment (optional)
 * @param quantity    How many items the user wants to buy (must be 1 or more)
 * @param name        The customer's name (optional but helpful)
 * @param email       The customer's email address (used for contact or receipt)
 * @param id          A custom ID from your system. Can be null. Used to track the payment.
 */
public record FirstPaymentRequest(

        BigDecimal amount,
        String currency,
        String provider, // ADYEN, STRIPE, PAYPAL
        String description,
        Long quantity,
        String name,
        String email,
        String successUrl,
        String cancelUrl,
        String id,
        String systemId, 
        String bookingId,
        Map<String, String> metadata
) {}

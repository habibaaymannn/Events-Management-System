package com.example.cdr.eventsmanagementsystem.DTO.Payment;


/**
 * This class is used to send a response after the first payment step.
 * <p>
 * It gives back important details like a redirect URL, payment reference,
 * and payment status, which can be shown to the user or used in the system.
 * </p>
 *
 * Example:
 * <pre>
 * {
 *   "redirectUrl": "https://payment.stripe.com/checkout/abc123",
 *   "referenceId": "txn_001234567",
 *   "status": "PENDING",
 *   "message": "Please complete payment using the link.",
 *   "customerId": "cus_123456789"
 * }
 * </pre>
 *
 * @param redirectUrl A link the user can use to complete the payment (can be null for some flows)
 * @param referenceId A unique ID for this payment, useful for tracking
 * @param status      The current status of the payment (like PENDING, SUCCESS, FAILED)
 * @param message     A message about the payment result (can be shown to the user)
 * @param customerId  The ID of the customer created or used in the payment system
 */
public record FirstPaymentResponse(

        String redirectUrl,
        String referenceId,
        String status,
        String message,
        String customerId
){}

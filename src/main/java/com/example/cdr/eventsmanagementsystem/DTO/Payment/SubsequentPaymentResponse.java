package com.example.cdr.eventsmanagementsystem.DTO.Payment;

/**
 * This class is used to send a response after a follow-up payment action.
 * <p>
 * Follow-up actions include capturing, canceling, or refunding a payment.
 * This response gives useful details about the result of that operation.
 * </p>
 *
 * Example:
 * <pre>
 * {
 *   "referenceId": "txn_123456789",
 *   "operationReference": "cap_456789",
 *   "amount": 2500,
 *   "currency": "USD",
 *   "status": "SUCCESS",
 *   "message": "Payment captured successfully."
 * }
 * </pre>
 *
 * @param referenceId         The original payment reference ID
 * @param operationReference  A new ID for this specific action (like refund or capture)
 * @param amount              The amount processed in this action (in minor units like cents)
 * @param currency            The 3-letter currency code (e.g., USD, EUR)
 * @param status              The result of the action (e.g., SUCCESS, FAILED)
 * @param message             A message giving more info about the result (can be shown to users or logs)
 */
public record SubsequentPaymentResponse(
        String referenceId,
        String operationReference,
        Long amount,
        String currency,
        String status,
        String message
) {}



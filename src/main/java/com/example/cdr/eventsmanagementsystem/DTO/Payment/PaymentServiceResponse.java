package com.example.cdr.eventsmanagementsystem.DTO.Payment;

/**
 * Wrapper response from the external payment service.
 * The payment service wraps the actual payment response in a standard API response structure.
 * 
 * Example:
 * <pre>
 * {
 *   "status": 200,
 *   "message": "Payment initiated successfully",
 *   "data": {
 *     "redirectUrl": "https://payment.stripe.com/checkout/abc123",
 *     "referenceId": "txn_001234567",
 *     "status": "PENDING",
 *     "message": "Please complete payment using the link.",
 *     "customerId": "cus_123456789"
 *   },
 *   "timestamp": 1729349000000
 * }
 * </pre>
 * 
 * @param status    HTTP status code
 * @param message   Response message
 * @param data      The actual payment response data
 * @param timestamp Response timestamp
 */
public record PaymentServiceResponse(
    Integer status,
    String message,
    FirstPaymentResponse data,
    Long timestamp
) {}


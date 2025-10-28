package com.example.cdr.eventsmanagementsystem.Constants;

public final class KafkaConstants {

    private KafkaConstants() {
    }

    // ============================================================
    // METADATA KEYS
    // ============================================================
    public static final String BOOKING_TYPE_KEY = "bookingType";

    // ============================================================
    // KEY DELIMITERS
    // ============================================================
    public static final String COMPOSITE_KEY_DELIMITER = "#";
    public static final int COMPOSITE_KEY_PARTS = 2;

    // ============================================================
    // PAYMENT STATUS VALUES
    // ============================================================
    public static final String STATUS_SUCCEEDED = "SUCCEEDED";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_REFUNDED = "REFUNDED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED";

    // ============================================================
    // LOG MESSAGES - KAFKA CONSUMER
    // ============================================================
    public static final String LOG_CONSUMING_EVENT = "Consuming payment status event - Key: {}, Partition: {}, Offset: {}";
    public static final String LOG_RECEIVED_EVENT = "Received payment status event - Key: {}, Partition: {}, Offset: {}, Status: {}";
    public static final String LOG_SUCCESSFULLY_PROCESSED = "Successfully processed payment status - System: {}, Booking: {}, Status: {}";
    public static final String LOG_ERROR_PROCESSING = "Error processing payment status event - Key: {}, Partition: {}, Offset: {}, Error: {}";

    // ============================================================
    // LOG MESSAGES - BOOKING CONFIRMATION
    // ============================================================
    public static final String LOG_CONFIRMING_BOOKING = "Confirming booking - Type: {}, Booking: {}, Amount: {} {}";
    public static final String LOG_CONFIRMED_BOOKING = "Successfully confirmed booking ID: {}";
    public static final String LOG_ALREADY_CONFIRMED = "Booking already confirmed, skipping update - ID: {}";

    // ============================================================
    // LOG MESSAGES - BOOKING FAILURE
    // ============================================================
    public static final String LOG_FAILING_BOOKING = "Failing booking - Type: {}, Booking: {}, Reason: {}";
    public static final String LOG_FAILED_BOOKING = "Successfully marked booking as failed - ID: {}";

    // ============================================================
    // LOG MESSAGES - BOOKING REFUND
    // ============================================================
    public static final String LOG_REFUNDING_BOOKING = "Processing refund - Type: {}, Booking: {}";
    public static final String LOG_REFUNDED_BOOKING = "Successfully processed refund for booking ID: {}";

    // ============================================================
    // LOG MESSAGES - BOOKING CANCELLATION
    // ============================================================
    public static final String LOG_CANCELLING_BOOKING = "Cancelling booking - Type: {}, Booking: {}";
    public static final String LOG_CANCELLED_BOOKING = "Successfully cancelled booking ID: {}";

    // ============================================================
    // LOG MESSAGES - BOOKING PAYMENT PENDING
    // ============================================================
    public static final String LOG_PAYMENT_PENDING = "Updating to payment pending - Type: {}, Booking: {}";
    public static final String LOG_UPDATED_PENDING = "Updated booking to payment pending - ID: {}";
    public static final String LOG_FINAL_STATE = "Booking in final state, skipping pending update - ID: {}, Status: {}";

    // ============================================================
    // LOG MESSAGES - PARTIAL REFUND
    // ============================================================
    public static final String LOG_PARTIAL_REFUND = "Processing partial refund - Type: {}, Booking: {}, Amount: {}";
    public static final String LOG_PARTIAL_REFUNDED = "Successfully processed partial refund for booking ID: {}";

    // ============================================================
    // LOG MESSAGES - PAYMENT STATUS HANDLERS
    // ============================================================
    public static final String LOG_PAYMENT_SUCCEEDED = "Payment succeeded - Type: {}, Booking: {}, Amount: {} {}";
    public static final String LOG_PAYMENT_FAILED = "Payment failed - Type: {}, Booking: {}, Reason: {}";
    public static final String LOG_PAYMENT_REFUNDED = "Payment refunded - Type: {}, Booking: {}";
    public static final String LOG_PAYMENT_CANCELLED = "Payment cancelled - Type: {}, Booking: {}";
    public static final String LOG_PAYMENT_PENDING_STATUS = "Payment pending - Type: {}, Booking: {}";
    public static final String LOG_PAYMENT_PARTIAL_REFUND = "Partial refund - Type: {}, Booking: {}, Amount: {}";

    // ============================================================
    // WARNING MESSAGES
    // ============================================================
    public static final String WARN_NO_BOOKING_FOUND = "No booking found for ID: {} and type: {}";
    public static final String WARN_MISSING_BOOKING_TYPE = "Missing bookingType in metadata";
    public static final String WARN_UNKNOWN_PAYMENT_STATUS = "Unknown payment status: {} for booking: {}";

    // ============================================================
    // ERROR MESSAGES - KEY VALIDATION
    // ============================================================
    public static final String ERROR_INVALID_KEY_FORMAT = "Invalid composite key format: {}";
    public static final String ERROR_KEY_MISMATCH = "Key mismatch - Key: {}, Event: {}/{}";

    // ============================================================
    // ERROR MESSAGES - BOOKING TYPE EXTRACTION
    // ============================================================
    public static final String ERROR_MISSING_BOOKING_TYPE = "Unable to determine booking type from metadata - System: {}, Booking: {}";
    public static final String ERROR_INVALID_BOOKING_TYPE = "Invalid bookingType value in metadata: {}";
    public static final String ERROR_EXTRACTING_BOOKING_TYPE = "Error extracting bookingType from metadata";

    // ============================================================
    // ERROR MESSAGES - BOOKING OPERATIONS
    // ============================================================
    public static final String ERROR_CONFIRM_BOOKING = "Failed to confirm booking ID: {}";
    public static final String ERROR_FAIL_BOOKING = "Failed to update booking status to failed - ID: {}";
    public static final String ERROR_REFUND_BOOKING = "Failed to process refund for booking ID: {}";
    public static final String ERROR_CANCEL_BOOKING = "Failed to cancel booking ID: {}";
    public static final String ERROR_UPDATE_PENDING = "Failed to update booking to payment pending - ID: {}";
    public static final String ERROR_PARTIAL_REFUND = "Failed to process partial refund for booking ID: {}";

    // ============================================================
    // ERROR MESSAGES - BOOKING LOOKUP
    // ============================================================
    public static final String ERROR_INVALID_BOOKING_ID = "Invalid booking ID format: {}";
    public static final String ERROR_FINDING_BOOKING = "Error finding booking - ID: {}, Type: {}";

    // ============================================================
    // EXCEPTION MESSAGES
    // ============================================================
    public static final String EXCEPTION_MISSING_BOOKING_TYPE = "Missing bookingType in metadata";
    public static final String EXCEPTION_INVALID_BOOKING_ID = "Invalid booking ID format: ";

    // ============================================================
    // CANCELLATION REASONS
    // ============================================================
    public static final String REASON_PAYMENT_FAILED = "Payment failed";
    public static final String REASON_FULL_REFUND = "Full refund processed";
    public static final String REASON_PAYMENT_CANCELLED = "Payment cancelled";
    public static final String REASON_PARTIAL_REFUND_PREFIX = "Partial refund of ";
}

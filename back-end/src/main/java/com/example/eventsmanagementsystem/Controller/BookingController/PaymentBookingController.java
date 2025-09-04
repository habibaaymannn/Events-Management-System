package com.example.eventsmanagementsystem.Controller.BookingController;

import com.example.eventsmanagementsystem.DTO.Booking.Response.BookingResponse;
import com.example.eventsmanagementsystem.Constants.PaymentConstants;
import com.example.eventsmanagementsystem.DTO.Payment.AuthorizePaymentRequest;
import com.example.eventsmanagementsystem.DTO.Payment.CapturePaymentRequest;
import com.example.eventsmanagementsystem.DTO.Payment.RefundRequest;
import com.example.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.eventsmanagementsystem.Service.Payment.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.eventsmanagementsystem.Constants.PaymentConstants.*;

/**
 * REST controller for booking payment operations.
 * Provides an endpoint to complete the payment process for a booking.
 */

@RestController
@RequestMapping(PAYMENT_BASE_URL)
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management for bookings")
public class PaymentBookingController {
    private final PaymentService paymentService;

    @Operation(summary = "Authorize payment", description = "Create a new authorization (hold funds) for a PENDING booking. Only works on unpaid bookings.")
    @PostMapping(PaymentConstants.AUTHORIZE_PAYMENT)
    public ResponseEntity<BookingResponse> authorize(
            @PathVariable Long bookingId,
            @PathVariable BookingType type,
            @RequestBody AuthorizePaymentRequest request
    ) {
        BookingResponse response = paymentService.authorizePayment(bookingId, type, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Capture authorized payment", description = "Capture funds from a previously authorized payment")
    @PostMapping(PaymentConstants.CAPTURE_PAYMENT)
    public ResponseEntity<BookingResponse> capture(
            @PathVariable Long bookingId,
            @PathVariable BookingType type,
            @RequestBody CapturePaymentRequest request
    ) {
        BookingResponse response = paymentService.capturePayment(bookingId, type, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Void authorization", description = "Void a previously authorized payment before capture")
    @PostMapping(PaymentConstants.VOID_PAYMENT)
    public ResponseEntity<BookingResponse> voidAuth(
            @PathVariable Long bookingId,
            @PathVariable BookingType type
    ) {
        BookingResponse response = paymentService.voidPayment(bookingId, type);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Refund payment", description = "Refund a captured payment")
    @PostMapping(PaymentConstants.REFUND_PAYMENT)
    public ResponseEntity<BookingResponse> refund(
            @PathVariable Long bookingId,
            @PathVariable BookingType type,
            @RequestBody RefundRequest request
    ) {
        BookingResponse response = paymentService.refundPayment(bookingId, type, request);
        return ResponseEntity.ok(response);
    }
}

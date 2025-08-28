package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Constants.PaymentConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.AuthorizePaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.CapturePaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.RefundRequest;
import com.example.cdr.eventsmanagementsystem.Service.Payment.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Booking - Payments", description = "Booking payment APIs")
public class PaymentBookingController extends BookingController{

    private final PaymentService paymentService;

    @Operation(summary = "Authorize payment", description = "Create a new authorization (hold funds) for a PENDING booking. Only works on unpaid bookings.")
    @PostMapping(PaymentConstants.AUTHORIZE_PAYMENT)
    public ResponseEntity<BookingDetailsResponse> authorize(
            @PathVariable Long bookingId,
            @RequestBody AuthorizePaymentRequest request) {
        BookingDetailsResponse response = paymentService.authorizePayment(bookingId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Capture authorized payment", description = "Capture funds from a previously authorized payment")
    @PostMapping(PaymentConstants.CAPTURE_PAYMENT)
    public ResponseEntity<BookingDetailsResponse> capture(
            @PathVariable Long bookingId,
            @RequestBody CapturePaymentRequest request) {
        BookingDetailsResponse response = paymentService.capturePayment(bookingId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Void authorization", description = "Void a previously authorized payment before capture")
    @PostMapping(PaymentConstants.VOID_PAYMENT)
    public ResponseEntity<BookingDetailsResponse> voidAuth(
            @PathVariable Long bookingId) {
        BookingDetailsResponse response = paymentService.voidPayment(bookingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Refund payment", description = "Refund a captured payment")
    @PostMapping(PaymentConstants.REFUND_PAYMENT)
    public ResponseEntity<BookingDetailsResponse> refund(
            @PathVariable Long bookingId,
            @RequestBody RefundRequest request) {
        BookingDetailsResponse response = paymentService.refundPayment(bookingId, request);
        return ResponseEntity.ok(response);
    }
}

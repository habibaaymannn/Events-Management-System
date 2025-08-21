package com.example.cdr.eventsmanagementsystem.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.Constants.RoleConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.CapturePaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.CompletePaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.RefundRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.CheckoutSessionResponse;
import com.example.cdr.eventsmanagementsystem.Service.Payment.PaymentServiceInterface;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment operations")
public class PaymentController {

    private final PaymentServiceInterface paymentService;

    @Operation(summary = "Capture booking payment", description = "Captures a previously authorized payment")
    @PostMapping("/bookings/{bookingId}/capture")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN_ROLE + "', '" + RoleConstants.ORGANIZER_ROLE + "')")
    public ResponseEntity<BookingDetailsResponse> capturePayment(
            @PathVariable Long bookingId,
            @RequestBody CapturePaymentRequest request) {
        BookingDetailsResponse response = paymentService.captureBookingPayment(bookingId, request.getAmountToCapture());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Void booking payment", description = "Voids a previously authorized payment")
    @PostMapping("/bookings/{bookingId}/void")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN_ROLE + "', '" + RoleConstants.ORGANIZER_ROLE + "')")
    public ResponseEntity<BookingDetailsResponse> voidPayment(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String reason) {
        BookingDetailsResponse response = paymentService.voidBookingPayment(bookingId, reason);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Refund booking payment", description = "Refunds a captured payment")
    @PostMapping("/bookings/{bookingId}/refund")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN_ROLE + "', '" + RoleConstants.ORGANIZER_ROLE + "')")
    public ResponseEntity<BookingDetailsResponse> refundPayment(
            @PathVariable Long bookingId,
            @RequestBody RefundRequest request) {
        BookingDetailsResponse response = paymentService.refundBookingPayment(bookingId, request.getAmount(), request.getReason());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create Checkout session to save card", description = "Returns a Stripe Checkout URL (mode=setup)")
    @PostMapping("/methods/setup-session")
    public ResponseEntity<CheckoutSessionResponse> createSetupSession() {
        CheckoutSessionResponse response = paymentService.createSetupCheckoutSessionForCurrentUser();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Set default payment method", description = "Sets the default saved card for auto payments")
    @PostMapping("/methods/default")
    public ResponseEntity<Void> setDefaultPaymentMethod(@RequestBody CompletePaymentRequest request) {
        paymentService.setDefaultPaymentMethodForCurrentUser(request.getPaymentMethodId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Confirm booking via Checkout session id", description = "Fallback confirm if webhook was missed")
    @GetMapping("/confirm")
    public ResponseEntity<BookingDetailsResponse> confirm(@RequestParam("session_id") String sessionId) {
        BookingDetailsResponse response = paymentService.confirmCheckoutSession(sessionId);
        return ResponseEntity.ok(response);
    }
}



package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.PaymentCompleteRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.Service.Booking.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Booking - Payments", description = "Booking payment APIs")
public class PaymentBookingController extends BookingController{

    private final BookingService bookingService;
    @Operation(summary = "Complete booking payment", description = "Completes the payment process for a booking")
    @PostMapping(BookingControllerConstants.COMPLETE_PAYMENT)
    public ResponseEntity<BookingDetailsResponse> completePayment(
            @PathVariable Long bookingId,
            @RequestBody PaymentCompleteRequest request) {

        BookingDetailsResponse response = bookingService.completePayment(bookingId, request.getPaymentMethodId());
        return ResponseEntity.ok(response);
    }
}

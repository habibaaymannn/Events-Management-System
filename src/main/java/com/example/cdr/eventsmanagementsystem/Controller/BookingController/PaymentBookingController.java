package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.PaymentCompleteRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Service.Booking.EventBookingService;
import com.example.cdr.eventsmanagementsystem.Service.Booking.ServiceBookingService;
import com.example.cdr.eventsmanagementsystem.Service.Booking.VenueBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.cdr.eventsmanagementsystem.Constants.BookingControllerConstants.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management for bookings")
public class PaymentBookingController {
    private final EventBookingService eventBookingService;
    private final VenueBookingService venueBookingService;
    private final ServiceBookingService serviceBookingService;

    @Operation(summary = "Complete event booking payment", description = "Completes the payment process for an event booking")
    @PostMapping(EVENT_BOOKING + COMPLETE_PAYMENT)
    public ResponseEntity<EventBookingResponse> completeEventPayment(@PathVariable Long bookingId, @RequestBody PaymentCompleteRequest request) {
        EventBookingResponse response = eventBookingService.completePayment(bookingId, request.getPaymentMethodId());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Complete venue booking payment", description = "Completes the payment process for a venue booking")
    @PostMapping(VENUE_BOOKING + COMPLETE_PAYMENT)
    public ResponseEntity<VenueBookingResponse> completeVenuePayment(@PathVariable Long bookingId, @RequestBody PaymentCompleteRequest request) {
        VenueBookingResponse response = venueBookingService.completePayment(bookingId, request.getPaymentMethodId());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Complete service booking payment", description = "Completes the payment process for a service booking")
    @PostMapping(SERVICE_BOOKING + COMPLETE_PAYMENT)
    public ResponseEntity<ServiceBookingResponse> completeServicePayment(@PathVariable Long bookingId, @RequestBody PaymentCompleteRequest request) {
        ServiceBookingResponse response = serviceBookingService.completePayment(bookingId, request.getPaymentMethodId());
        return ResponseEntity.ok(response);
    }
}

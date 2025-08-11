package com.example.cdr.eventsmanagementsystem.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.CancelBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.CombinedBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.CompletePaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.CombinedBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Service.Booking.IBookingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final IBookingService bookingService;

    @PostMapping("/events")
    // @PreAuthorize("hasRole('attendee')")
    public ResponseEntity<EventBookingResponse> bookEvent(
            @RequestBody EventBookingRequest request) {
        EventBookingResponse response = bookingService.bookEvent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/venues")
    // @PreAuthorize("hasRole('organizer')")
    public ResponseEntity<VenueBookingResponse> bookVenue(
            @RequestBody VenueBookingRequest request) {
        VenueBookingResponse response = bookingService.bookVenue(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/services")
    // @PreAuthorize("hasRole('organizer')")
    public ResponseEntity<ServiceBookingResponse> bookService(
            @RequestBody ServiceBookingRequest request) {
        ServiceBookingResponse response = bookingService.bookService(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/combined")
    // @PreAuthorize("hasRole('organizer')")
    public ResponseEntity<CombinedBookingResponse> bookResources(
            @RequestBody CombinedBookingRequest request) {
        CombinedBookingResponse response = bookingService.bookResources(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancel")
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee')")
    public ResponseEntity<Void> cancelBooking(
            @RequestBody CancelBookingRequest request) {
        bookingService.cancelBooking(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{bookingId}")
    // @PreAuthorize("hasRole('organizer') or hasRole('attendee') or hasRole('admin')")
    public ResponseEntity<BookingDetailsResponse> getBooking(@PathVariable Long bookingId) {
        BookingDetailsResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendee/{attendeeId}")
    // @PreAuthorize("hasRole('attendee') or hasRole('admin')")
    public ResponseEntity<List<BookingDetailsResponse>> getBookingsByAttendee(
            @PathVariable String attendeeId) {
        List<BookingDetailsResponse> responses = bookingService.getBookingsByAttendee(attendeeId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/event/{eventId}")
    // @PreAuthorize("hasRole('organizer') or hasRole('admin')")
    public ResponseEntity<List<BookingDetailsResponse>> getBookingsByEvent(
            @PathVariable Long eventId) {
        List<BookingDetailsResponse> responses = bookingService.getBookingsByEvent(eventId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{bookingId}/status/{status}")
    // @PreAuthorize("hasRole('admin')")
    public ResponseEntity<BookingDetailsResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @PathVariable BookingStatus status) {
        BookingDetailsResponse response = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/complete-payment")
    public ResponseEntity<BookingDetailsResponse> completePayment(
            @PathVariable Long bookingId,
            @RequestBody CompletePaymentRequest request) {
        
        BookingDetailsResponse response = bookingService.completePayment(bookingId, request.getPaymentMethodId());
        return ResponseEntity.ok(response);
    }
}

package com.example.cdr.eventsmanagementsystem.Service.Booking;

import java.util.List;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.BookingCancelRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.EventBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.ServiceBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Request.VenueBookingRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingDetailsResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.EventBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.ServiceBookingResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.VenueBookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;

public interface BookingServiceInterface {
    EventBookingResponse bookEvent(EventBookingRequest request);
    VenueBookingResponse bookVenue(VenueBookingRequest request);
    ServiceBookingResponse bookService(ServiceBookingRequest request);
//    CombinedBookingResponse bookResources(CombinedBookingRequest request);

    void cancelBooking(BookingCancelRequest request);
    BookingDetailsResponse getBookingById(Long bookingId);
    List<BookingDetailsResponse> getBookingsByAttendee(String attendeeId);
    List<BookingDetailsResponse> getBookingsByEvent(Long eventId);
    BookingDetailsResponse updateBookingStatus(Long bookingId, BookingStatus status);
}
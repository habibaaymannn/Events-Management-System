package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class BookingControllerConstants {
    public static final String BOOKING_BASE_URL = "/v1/bookings";

    // Event Booking
    public static final String EVENT_BOOKING = "/events";

    // Venue Booking
    public static final String VENUE_BOOKING = "/venues";

    // Service Booking
    public static final String SERVICE_BOOKING = "/services";

    // Cancel Booking
    public static final String CANCEL_BOOKING = "/cancel";

    // Payment
    public static final String COMPLETE_PAYMENT = "/{bookingId}/complete-payment";

    // General Retrievals
    public static final String GET_BOOKING_BY_ID = "/{bookingId}";
    public static final String GET_BOOKINGS_BY_ATTENDEE = "/attendee/{attendeeId}";
    public static final String GET_BOOKINGS_BY_EVENT = "/event/{eventId}";

    // Update Booking Status
    public static final String UPDATE_BOOKING_STATUS = "/{bookingId}/status/{status}";

    private BookingControllerConstants() {}
}

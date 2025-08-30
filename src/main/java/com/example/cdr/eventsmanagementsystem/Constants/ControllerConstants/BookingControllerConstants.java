package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class BookingControllerConstants {
    public static final String BOOKING_BASE_URL = "/v1/bookings";

    public static final String EVENT_BOOKING = "/events";

    public static final String VENUE_BOOKING = "/venues";

    public static final String SERVICE_BOOKING = "/services";

    public static final String CANCEL_BOOKING = "/cancel";

    public static final String GET_BOOKING_BY_ID = "/{bookingId}";
    public static final String GET_BOOKINGS_BY_ATTENDEE = "/attendee/{attendeeId}";
    public static final String GET_BOOKINGS_BY_EVENT = "/event/{eventId}";

    public static final String UPDATE_BOOKING_STATUS = "/{bookingId}/status/{status}";

    private BookingControllerConstants() {}
}

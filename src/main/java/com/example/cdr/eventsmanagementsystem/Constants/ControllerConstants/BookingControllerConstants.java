package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class BookingControllerConstants {
    public static final String EVENT_BOOKING = "v1/bookings/events";
    public static final String VENUE_BOOKING = "v1/bookings/venues";
    public static final String SERVICE_BOOKING = "v1/bookings/services";

    public static final String GET_BOOKING_BY_ID = "/{bookingId}";
    public static final String UPDATE_BOOKING_STATUS = "/{bookingId}/status/{status}";
    public static final String CANCEL_BOOKING = "/cancel";
    public static final String COMPLETE_PAYMENT = "/complete-payment/{bookingId}";

    private BookingControllerConstants() {}
}

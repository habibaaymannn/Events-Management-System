package com.example.cdr.eventsmanagementsystem.Constants;

public class ControllerConstants {
    public static final String VENUE_BASE_URL = "/v1/venues";
    //public static final String CREATE_VENUE_URL = VENUE_BASE_URL + "/create";
    public static final String UPDATE_VENUE_URL = VENUE_BASE_URL + "/{venueId}";
    public static final String DELETE_VENUE_URL = VENUE_BASE_URL + "/{venueId}";
    public static final String GET_VENUE_BOOKINGS_URL = VENUE_BASE_URL + "bookings";
    public static final String CANCEL_VENUE_BOOKING_URL = VENUE_BASE_URL + "/bookings/{bookingId}/cancel";

    public static final String EVENT_BASE_URL = "/v1/events";
    public static final String SERVICE_BASE_URL = "/v1/services";
    public static final String BOOKING_BASE_URL = "/v1/bookings";
    public static final String ADMIN_BASE_URL = "/v1/admin";




}

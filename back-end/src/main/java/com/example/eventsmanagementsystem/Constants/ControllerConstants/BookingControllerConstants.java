package com.example.eventsmanagementsystem.Constants.ControllerConstants;

public final class BookingControllerConstants {
    public static final String EVENT_BOOKING = "v1/bookings/events";
    public static final String VENUE_BOOKING = "v1/bookings/venues";
    public static final String SERVICE_BOOKING = "v1/bookings/services";

    public static final String GET_ALL = "/all";
    public static final String GET_BOOKING_BY_ID = "/{bookingId}";
    public static final String CREATE_BOOKING = "/create";
    public static final String UPDATE_BOOKING_STATUS = "/{bookingId}/status/{status}";
    public static final String CANCEL_BOOKING = "/cancel";

    // Event Booking
    public static final String GET_BOOKING_BY_EVENT_ID = "/event/{eventId}";
    public static final String GET_BOOKING_BY_ATTENDEE_ID = "/attendee/{attendeeId}";

    // Service Booking
    public static final String GET_ALL_SERVICE_BOOKINGS_BY_ORGANIZER_ID = "/organizer/{organizerId}";
    public static final String GET_ALL_SERVICE_BOOKINGS_BY_SERVICE_PROVIDER_ID = "/service-provider/{serviceProviderId}";

    // Venue Booking
    public static final String GET_ALL_VENUE_BOOKINGS_BY_ORGANIZER_ID = "/organizer/{organizerId}";
    public static final String GET_ALL_VENUE_BOOKINGS_BY_VENUE_PROVIDER_ID = "/venue-provider/{venueProviderId}";

    private BookingControllerConstants() {}
}

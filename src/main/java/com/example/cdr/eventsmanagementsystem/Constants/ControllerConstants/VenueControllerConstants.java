package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class VenueControllerConstants {
    public static final String VENUE_BASE_URL = "/v1/venues";
    public static final String CREATE_VENUE_URL = "/create";
    public static final String UPDATE_VENUE_URL = "/{venueId}";
    public static final String DELETE_VENUE_URL = "/{venueId}";
    public static final String GET_VENUE_BOOKINGS_URL = "/bookings";
    public static final String GET_ALL_VENUES_URL = "/all";
    public static final String UPDATE_VENUE_AVAILABILITY = "/{venueId}/update-availability";

    private VenueControllerConstants() {}
}

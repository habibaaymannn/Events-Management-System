package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class ServiceControllerConstants {

    public static final String SERVICE_BASE_URL = "/v1/services";
    public static final String CREATE_SERVICE_URL ="/create";
    public static final String UPDATE_SERVICE_AVAILABILITY = "/{serviceId}/update-availability";
    public static final String GET_SERVICE_BOOKINGS_URL = "/bookings";
    public static final String GET_ALL_SERVICES_URL = "/all";
    public static final String ACCEPT_OR_REJECT_SERVICE_BOOKING_URL = "/bookings/{bookingId}/status";

    private ServiceControllerConstants() {}
}

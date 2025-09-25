package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class EventsControllerConstants {
    public static final String EVENT_BASE_URL = "/v1/events";
    public static final String CREATE_EVENT_URL = "/create";
    public static final String UPDATE_EVENT_URL = "/{id}";
    public static final String DELETE_EVENT_URL = "/{id}";
    public static final String GET_ALL_EVENTS_URL = "/all";
    public static final String GET_EVENT_BY_ID_URL = "/{id}";
    public static final String GET_EVENTS_BY_TYPE_URL = "/type/{type}";
    public static final String GET_EVENTS_BY_ORGANIZER_URL = "/organizer";
    public static final String CANCEL_EVENT_URL = "/{id}/cancel";
    public static final String EVENTS_BY_STATUS_URL = "/by-status";

    public static final String FLAG_EVENT_URL = "/{eventId}/flag";
    public static final String GET_FLAGGED_EVENTS_URL = "/flagged";


    private EventsControllerConstants() {}
}

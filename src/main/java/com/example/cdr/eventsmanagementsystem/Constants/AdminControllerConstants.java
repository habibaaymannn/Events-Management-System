package com.example.cdr.eventsmanagementsystem.Constants;

public class AdminControllerConstants {

    public static final String ADMIN_BASE_URL = "/v1/admin";

    // User management
    public static final String ADMIN_USERS_URL ="/users";
    public static final String ADMIN_UPDATE_USER_ROLE_URL ="/{userId}/role";
    public static final String ADMIN_USER_DEACTIVATE_URL = "/{userId}/deactivate";

    // Event management
    public static final String ADMIN_EVENTS_URL = "/events";
    public static final String ADMIN_EVENTS_BY_STATUS_URL ="/by-status";
    public static final String ADMIN_EVENT_CANCEL_URL = "/{eventId}/cancel";

    // Dashboard
    public static final String ADMIN_DASHBOARD_URL ="/dashboard";
    public static final String ADMIN_EVENT_TYPE_DISTRIBUTION_URL = "/event-type-distribution";
    public static final String ADMIN_DAILY_BOOKINGS_URL = "/daily-bookings";
    public static final String ADMIN_DAILY_CANCELLATIONS_URL = "/daily-cancellations";
}

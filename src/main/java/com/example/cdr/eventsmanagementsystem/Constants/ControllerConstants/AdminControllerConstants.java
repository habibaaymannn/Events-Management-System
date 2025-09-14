package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class AdminControllerConstants {

    // Base
    public static final String ADMIN_BASE_URL = "/v1/admin";

    // ---------- Users ----------
    public static final String ADMIN_USERS_URL = "/users";
    public static final String USER_ID = "/{userId}";
    public static final String ADMIN_UPDATE_USER_ROLE_URL = USER_ID + "/role";
    public static final String ADMIN_USER_DEACTIVATE_URL = USER_ID + "/deactivate";
    public static final String USER_ACTIVATE = USER_ID + "/activate";
    public static final String USER_RESET_PASSWORD = USER_ID + "/reset-password";

    // ---------- Events ----------
    public static final String ADMIN_EVENTS_URL = "/events";
    public static final String ADMIN_EVENTS_BY_STATUS_URL = "/by-status";
    // Keep cancel path exactly as in your controller (no /events prefix):
    public static final String ADMIN_EVENT_CANCEL_URL = "/{eventId}/cancel";
    // Flagging (as per the admin controller that exposes them under /events)
    public static final String ADMIN_EVENT_FLAG_URL = "/events/{eventId}/flag";
    public static final String ADMIN_EVENTS_FLAGGED_URL = "/events/flagged";

    // ---------- Dashboard / Analytics ----------
    public static final String ADMIN_DASHBOARD_URL = "/dashboard";
    public static final String ADMIN_EVENT_TYPE_DISTRIBUTION_URL = "/event-type-distribution";
    public static final String ADMIN_DAILY_BOOKINGS_URL = "/daily-bookings";
    public static final String ADMIN_DAILY_CANCELLATIONS_URL = "/daily-cancellations";

    private AdminControllerConstants() {}
}

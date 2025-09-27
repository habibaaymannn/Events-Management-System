package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class AdminControllerConstants {

    // Base
    public static final String ADMIN_BASE_URL = "/v1/admin";

    // ---------- Users ----------
    public static final String ADMIN_USERS_URL = "/users";
    public static final String USER_ID = "/{userId}";

    // ✅ include /users here:
    public static final String ADMIN_UPDATE_USER_ROLE_URL = ADMIN_USERS_URL + USER_ID + "/role";
    public static final String ADMIN_USER_DEACTIVATE_URL  = ADMIN_USERS_URL + USER_ID + "/deactivate";
    public static final String USER_ACTIVATE              = ADMIN_USERS_URL + USER_ID + "/activate";
    public static final String USER_RESET_PASSWORD        = ADMIN_USERS_URL + USER_ID + "/reset-password";

    // ---------- Dashboard / Analytics ----------
    public static final String ADMIN_DASHBOARD_URL = "/dashboard";
    public static final String ADMIN_EVENT_TYPE_DISTRIBUTION_URL = "/event-type-distribution";
    public static final String ADMIN_DAILY_BOOKINGS_URL = "/daily-bookings";
    public static final String ADMIN_DAILY_CANCELLATIONS_URL = "/daily-cancellations";

    private AdminControllerConstants() {}
}

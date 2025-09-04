package com.example.eventsmanagementsystem.Constants.ControllerConstants;

public final class ServiceControllerConstants {

    public static final String SERVICE_BASE_URL = "/v1/services";
    public static final String CREATE_SERVICE_URL ="/create";
    public static final String GET_SERVICE_BY_ID_URL= "/{id}";
    public static final String UPDATE_SERVICE_AVAILABILITY = "/{serviceId}/update-availability";
    public static final String GET_ALL_SERVICES_URL = "/all";

    private ServiceControllerConstants() {}
}

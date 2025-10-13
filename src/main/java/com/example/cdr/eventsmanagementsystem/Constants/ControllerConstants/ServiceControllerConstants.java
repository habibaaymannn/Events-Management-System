package com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants;

public final class ServiceControllerConstants {

    public static final String SERVICE_BASE_URL = "/v1/services";
    public static final String GET_SERVICE_BY_ID_URL= "/{id}";
    public static final String GET_SERVICES_BY_PROVIDER_URL = "all/provider";
    public static final String GET_ALL_SERVICES_URL = "/all";
    public static final String CREATE_SERVICE_URL ="/create";
    public static final String GET_AVAILABLE_SERVICE_URL = "/available";
    public static final String UPDATE_SERVICE_URL = "/{serviceId}";
    public static final String DELETE_SERVICE_URL = "/{serviceId}";

    private ServiceControllerConstants() {}
}

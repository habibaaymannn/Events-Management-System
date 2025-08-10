package com.example.cdr.eventsmanagementsystem.Service.Service;

import com.example.cdr.eventsmanagementsystem.Model.Service.Services;

import java.nio.file.AccessDeniedException;

public interface IServicesService {
    Services addService(Services service);
    Services updateAvailability(Long serviceId) throws AccessDeniedException;
}

package com.example.eventsmanagementsystem.Mapper;

import com.example.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.eventsmanagementsystem.Model.Service.Services;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ServiceMapper {
    Services toService(ServicesDTO dto);

    @Mapping(source = "serviceProvider.keycloakId", target = "serviceProviderId")
    ServicesDTO toServiceDTO(Services service);
}

package com.example.cdr.eventsmanagementsystem.Mapper;

import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ServiceMapper {
    Services toService(ServicesDTO dto);

    @Mapping(source = "serviceProvider.keycloakId", target = "serviceProviderId")
    ServicesDTO toServiceDTO(Services service);

    @Mapping(target = "id", ignore = true)
    void updateService(ServicesDTO dto, @MappingTarget Services service);
}

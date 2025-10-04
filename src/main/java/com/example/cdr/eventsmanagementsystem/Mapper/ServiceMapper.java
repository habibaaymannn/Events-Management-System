package com.example.cdr.eventsmanagementsystem.Mapper;

import java.util.Collections;
import java.util.List;

import com.example.cdr.eventsmanagementsystem.DTO.Service.ServicesDTO;
import com.example.cdr.eventsmanagementsystem.Model.Service.Services;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ServiceMapper {
    @Mapping(target = "images", ignore = true)
    Services toService(ServicesDTO dto);

    @Mapping(source = "serviceProvider.keycloakId", target = "serviceProviderId")
    @Mapping(target = "images", expression = "java(bytesToBase64(venue.getImages()))")
    ServicesDTO toServiceDTO(Services service);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    void updateService(ServicesDTO dto, @MappingTarget Services service);

    default List<String> bytesToBase64(List<byte[]> images) {
        if (images == null) return Collections.emptyList();
        return images.stream()
                .map(img -> java.util.Base64.getEncoder().encodeToString(img))
                .toList();
    }
}

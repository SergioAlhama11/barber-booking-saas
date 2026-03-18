package com.sergio.api.service.mapper;

import com.sergio.api.service.dto.CreateServiceRequest;
import com.sergio.api.service.dto.ServiceResponse;
import com.sergio.domain.service.Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface ServiceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "barbershopId", ignore = true)
    Service toDomain(CreateServiceRequest request);

    ServiceResponse toDto(Service service);
}

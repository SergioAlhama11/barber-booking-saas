package com.sergio.infrastructure.persistence.service.mapper;

import com.sergio.domain.service.Service;
import com.sergio.infrastructure.persistence.service.ServiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface ServicePersistenceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ServiceEntity toEntity(Service service);

    Service toDomain(ServiceEntity entity);
}

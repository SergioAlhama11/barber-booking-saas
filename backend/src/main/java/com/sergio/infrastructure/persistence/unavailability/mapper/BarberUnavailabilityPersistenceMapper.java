package com.sergio.infrastructure.persistence.unavailability.mapper;

import com.sergio.domain.unavailability.BarberUnavailability;
import com.sergio.infrastructure.persistence.unavailability.BarberUnavailabilityEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface BarberUnavailabilityPersistenceMapper {

    BarberUnavailabilityEntity toEntity(BarberUnavailability service);

    BarberUnavailability toDomain(BarberUnavailabilityEntity entity);
}

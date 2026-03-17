package com.sergio.infrastructure.persistence.barber.mapper;

import com.sergio.domain.barber.Barber;
import com.sergio.infrastructure.persistence.barber.BarberEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface BarberPersistenceMapper {

    @Mapping(target = "id", ignore = true)
    BarberEntity toEntity(Barber barber);

    Barber toDomain(BarberEntity barberEntity);
}

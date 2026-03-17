package com.sergio.infrastructure.persistence.barbershop.mapper;

import com.sergio.domain.barbershop.Barbershop;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface BarbershopPersistenceMapper {

    @Mapping(target = "id", ignore = true)
    BarbershopEntity toEntity(Barbershop barbershop);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "slug", source = "slug")
    Barbershop toDomain(BarbershopEntity barbershopEntity);
}

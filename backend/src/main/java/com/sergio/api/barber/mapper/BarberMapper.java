package com.sergio.api.barber.mapper;

import com.sergio.api.barber.dto.BarberResponse;
import com.sergio.api.barber.dto.CreateBarberRequest;
import com.sergio.domain.barber.Barber;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface BarberMapper {

    BarberResponse toDto(Barber barber);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "barbershopId", ignore = true)
    Barber toDomain(CreateBarberRequest createBarberRequest);
}

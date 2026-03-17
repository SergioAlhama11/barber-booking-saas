package com.sergio.api.barber.mapper;

import com.sergio.api.barber.dto.BarberResponse;
import com.sergio.api.barber.dto.CreateBarberRequest;
import com.sergio.api.barbershop.dto.BarbershopResponse;
import com.sergio.api.barbershop.dto.CreateBarbershopRequest;
import com.sergio.domain.barber.Barber;
import com.sergio.domain.barbershop.Barbershop;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface BarberMapper {

    BarberResponse toDto(Barber barber);

    Barber toDomain(CreateBarberRequest createBarberRequest);
}

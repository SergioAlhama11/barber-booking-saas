package com.sergio.api.barbershop.mapper;

import com.sergio.api.barbershop.dto.BarbershopResponse;
import com.sergio.api.barbershop.dto.CreateBarbershopRequest;
import com.sergio.domain.barbershop.Barbershop;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface BarbershopMapper {

    BarbershopResponse toDto(Barbershop barbershop);

    @Mapping(target = "slug", ignore = true)
    Barbershop toDomain(CreateBarbershopRequest createBarbershopRequest);
}

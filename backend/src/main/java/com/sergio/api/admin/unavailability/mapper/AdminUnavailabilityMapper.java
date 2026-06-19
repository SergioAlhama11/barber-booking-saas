package com.sergio.api.admin.unavailability.mapper;

import com.sergio.api.admin.unavailability.dto.BarberUnavailabilityResponse;
import com.sergio.api.admin.unavailability.dto.CreateBarberUnavailabilityRequest;
import com.sergio.domain.unavailability.BarberUnavailability;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface AdminUnavailabilityMapper {

    BarberUnavailabilityResponse toDto(BarberUnavailability barberUnavailability);

    BarberUnavailability toDomain(CreateBarberUnavailabilityRequest request);
}

package com.sergio.api.appointment.mapper;

import com.sergio.api.appointment.dto.AppointmentResponse;
import com.sergio.api.appointment.dto.CreateAppointmentRequest;
import com.sergio.domain.appointment.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "barbershopId", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    Appointment toDomain(CreateAppointmentRequest request);

    AppointmentResponse toDto(Appointment appointment);
}
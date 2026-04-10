package com.sergio.api.appointment.mapper;

import com.sergio.api.appointment.dto.AppointmentResponse;
import com.sergio.api.appointment.dto.CreateAppointmentRequest;
import com.sergio.domain.appointment.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

@Mapper(componentModel = "cdi")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "barbershopId", ignore = true)
    @Mapping(target = "barberName", ignore = true)
    @Mapping(target = "serviceName", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    Appointment toDomain(CreateAppointmentRequest request);

    AppointmentResponse toDto(Appointment appointment);
}
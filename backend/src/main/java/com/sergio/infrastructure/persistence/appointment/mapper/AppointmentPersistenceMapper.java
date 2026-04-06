package com.sergio.infrastructure.persistence.appointment.mapper;

import com.sergio.domain.appointment.Appointment;
import com.sergio.infrastructure.persistence.appointment.AppointmentEntity;
import com.sergio.infrastructure.persistence.appointment.AppointmentProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "cdi")
public interface AppointmentPersistenceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "cancelToken", ignore = true)
    @Mapping(target = "cancelTokenExpiresAt", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "lastResendAt", ignore = true)
    AppointmentEntity toEntity(Appointment appointment);

    @Mapping(target = "barberName", ignore = true)
    @Mapping(target = "serviceName", ignore = true)
    @Mapping(target = "cancelledAt", source = "cancelledAt")
    Appointment toDomain(AppointmentEntity appointmentEntity);

    Appointment toDomain(AppointmentProjection projection);
}

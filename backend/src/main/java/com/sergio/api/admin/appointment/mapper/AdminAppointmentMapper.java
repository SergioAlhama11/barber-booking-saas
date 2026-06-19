package com.sergio.api.admin.appointment.mapper;

import com.sergio.api.admin.appointment.dto.AdminAppointmentResponse;
import com.sergio.api.admin.appointment.dto.AdminCreateAppointmentRequest;
import com.sergio.api.admin.appointment.dto.AdminUpdateAppointmentRequest;
import com.sergio.domain.appointment.Appointment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface AdminAppointmentMapper {

    AdminAppointmentResponse toDto(Appointment appointment);

    Appointment toDomain(AdminCreateAppointmentRequest request);

    Appointment toDomain(AdminUpdateAppointmentRequest request);
}
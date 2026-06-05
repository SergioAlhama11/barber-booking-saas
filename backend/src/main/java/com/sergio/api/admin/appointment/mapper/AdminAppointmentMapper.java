package com.sergio.api.admin.appointment.mapper;

import com.sergio.api.admin.appointment.dto.AdminAppointmentResponse;
import com.sergio.domain.appointment.Appointment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface AdminAppointmentMapper {

    AdminAppointmentResponse toDto(Appointment appointment);
}
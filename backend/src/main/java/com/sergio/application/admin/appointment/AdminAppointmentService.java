package com.sergio.application.admin.appointment;

import com.sergio.api.admin.appointment.dto.AdminAppointmentFilterRequest;
import com.sergio.domain.appointment.Appointment;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.appointment.mapper.AppointmentPersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class AdminAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentPersistenceMapper mapper;

    public AdminAppointmentService(
            AppointmentRepository appointmentRepository,
            AppointmentPersistenceMapper mapper
    ) {
        this.appointmentRepository = appointmentRepository;
        this.mapper = mapper;
    }

    public List<Appointment> findAll(
            Long barbershopId,
            AdminAppointmentFilterRequest filter
    ) {

        return appointmentRepository
                .findDetailedByFilters(
                        barbershopId,
                        filter
                )
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}
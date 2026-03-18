package com.sergio.application.appointment;

import com.sergio.application.service.ServiceService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.exception.AppointmentConflictException;
import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import com.sergio.domain.service.Service;
import com.sergio.infrastructure.persistence.appointment.AppointmentEntity;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.appointment.mapper.AppointmentPersistenceMapper;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@ApplicationScoped
public class AppointmentService {

    @Inject
    AppointmentRepository appointmentRepository;

    @Inject
    BarbershopRepository barbershopRepository;

    @Inject
    BarberRepository barberRepository;

    @Inject
    ServiceService serviceService;

    @Inject
    AppointmentPersistenceMapper appointmentPersistenceMapper;

    public List<Appointment> findAllByBarbershop(String slug) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        return appointmentRepository.findByBarbershopId(barbershopId)
                .stream()
                .map(appointmentPersistenceMapper::toDomain)
                .toList();
    }

    public Appointment findById(String slug, Long id) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        AppointmentEntity entity = appointmentRepository
                .find("id = ?1 and barbershopId = ?2", id, barbershopId)
                .firstResult();

        if (entity == null) {
            throw new NotFoundException("Appointment not found");
        }

        return appointmentPersistenceMapper.toDomain(entity);
    }

    @Transactional
    public Appointment create(String slug, Appointment appointment) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        if (!appointment.getStartTime().isAfter(now)) {
            throw new InvalidAppointmentException("Start time must be in the future");
        }

        if (!barberRepository.existsByIdAndBarbershopId(appointment.getBarberId(), barbershopId)) {
            throw new NotFoundException("Barber not found in this barbershop");
        }

        Service service = serviceService.findById(slug, appointment.getServiceId());
        LocalDateTime endTime = appointment.getStartTime().plusMinutes(service.getDurationMinutes());

        if (appointmentRepository.existsOverlapping(appointment.getBarberId(), appointment.getStartTime(), endTime)) {
            throw new AppointmentConflictException("Time slot already booked");
        }

        AppointmentEntity entity = appointmentPersistenceMapper.toEntity(appointment);
        entity.setBarbershopId(barbershopId);
        entity.setEndTime(endTime);
        entity.setCreatedAt(Instant.now());

        appointmentRepository.persist(entity);

        return appointmentPersistenceMapper.toDomain(entity);
    }

    private Long getBarbershopIdOrThrow(String slug) {
        BarbershopEntity barbershop = barbershopRepository.find("slug", slug).firstResult();

        if (barbershop == null) {
            throw new NotFoundException("Barbershop not found");
        }

        return barbershop.getId();
    }
}

package com.sergio.application.appointment;

import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.exception.AppointmentConflictException;
import com.sergio.domain.appointment.exception.InvalidAppointmentException;
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
        if (!appointment.getStartTime().isBefore(appointment.getEndTime())) {
            throw new InvalidAppointmentException("Start time must be before end time");
        }

        Long barbershopId = getBarbershopIdOrThrow(slug);

        boolean barberExists = barberRepository.existsByIdAndBarbershopId(
                appointment.getBarberId(),
                barbershopId
        );

        if (!barberExists) {
            throw new NotFoundException("Barber not found in this barbershop");
        }

        boolean overlap = appointmentRepository.existsOverlapping(
                appointment.getBarberId(),
                appointment.getStartTime(),
                appointment.getEndTime()
        );

        if (overlap) {
            throw new AppointmentConflictException("Time slot already booked");
        }

        AppointmentEntity entity = appointmentPersistenceMapper.toEntity(appointment);
        entity.setBarbershopId(barbershopId);
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

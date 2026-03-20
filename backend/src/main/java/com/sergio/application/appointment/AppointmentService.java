package com.sergio.application.appointment;

import com.sergio.application.service.ServiceService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.AppointmentFilter;
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
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;

@ApplicationScoped
public class AppointmentService {

    private static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);

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

        return appointmentRepository.findByIdAndBarbershopId(barbershopId, id)
                .map(appointmentPersistenceMapper::toDomain)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));
    }

    public List<Appointment> findByEmail(String slug, String email, AppointmentFilter filter) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        return appointmentRepository
                .findByBarbershopIdAndEmail(barbershopId, email)
                .stream()
                .filter(a -> switch (filter) {
                    case FUTURE -> !a.getStartTime().isBefore(now);
                    case PAST -> a.getStartTime().isBefore(now);
                    case ALL -> true;
                })
                .map(appointmentPersistenceMapper::toDomain)
                .toList();
    }

    @Transactional
    public Appointment create(String slug, Appointment appointment) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        validateStartTime(appointment.getStartTime(), now);
        validateBarber(appointment.getBarberId(), barbershopId);

        Service service = serviceService.findById(slug, appointment.getServiceId());

        LocalDateTime start = appointment.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDurationMinutes());

        validateWorkingHours(start, end);
        validateNoOverlap(appointment.getBarberId(), start, end);

        AppointmentEntity entity = appointmentPersistenceMapper.toEntity(appointment);
        entity.setBarbershopId(barbershopId);
        entity.setEndTime(end);
        entity.setCreatedAt(Instant.now());

        appointmentRepository.persist(entity);

        return appointmentPersistenceMapper.toDomain(entity);
    }

    @Transactional
    public void cancelAppointmentByEmail(String slug, Long id, String email) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        AppointmentEntity entity = appointmentRepository
                .findByIdAndBarbershopId(barbershopId, id)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        validateOwnership(entity, email);
        validateNotPast(entity.getStartTime(), now);

        appointmentRepository.delete(entity);
    }

    private void validateStartTime(LocalDateTime start, LocalDateTime now) {
        if (!start.isAfter(now)) {
            throw new InvalidAppointmentException("Start time must be in the future");
        }
    }

    private void validateBarber(Long barberId, Long barbershopId) {
        if (!barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
            throw new NotFoundException("Barber not found in this barbershop");
        }
    }

    private void validateWorkingHours(LocalDateTime start, LocalDateTime end) {
        if (start.toLocalTime().isBefore(OPENING_TIME)
                || end.toLocalTime().isAfter(CLOSING_TIME)) {
            throw new InvalidAppointmentException("Appointment outside working hours");
        }
    }

    private void validateNoOverlap(Long barberId, LocalDateTime start, LocalDateTime end) {
        if (appointmentRepository.existsOverlapping(barberId, start, end)) {
            throw new AppointmentConflictException("Time slot already booked");
        }
    }

    private void validateOwnership(AppointmentEntity entity, String email) {
        if (!entity.getCustomerEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("You cannot cancel this appointment");
        }
    }

    private void validateNotPast(LocalDateTime startTime, LocalDateTime now) {
        if (startTime.isBefore(now)) {
            throw new InvalidAppointmentException("Cannot cancel past appointments");
        }
    }

    private Long getBarbershopIdOrThrow(String slug) {
        return barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }
}

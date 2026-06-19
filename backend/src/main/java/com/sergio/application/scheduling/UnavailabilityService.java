package com.sergio.application.scheduling;

import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import com.sergio.domain.unavailability.BarberUnavailability;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.unavailability.BarberUnavailabilityEntity;
import com.sergio.infrastructure.persistence.unavailability.BarberUnavailabilityRepository;
import com.sergio.infrastructure.persistence.unavailability.mapper.BarberUnavailabilityPersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class UnavailabilityService {

    private final BarberUnavailabilityRepository repository;
    private final BarberRepository barberRepository;
    private final AppointmentRepository appointmentRepository;
    private final BarberUnavailabilityPersistenceMapper mapper;

    public UnavailabilityService(BarberUnavailabilityRepository repository, BarberRepository barberRepository, AppointmentRepository appointmentRepository, BarberUnavailabilityPersistenceMapper mapper) {
        this.repository = repository;
        this.barberRepository = barberRepository;
        this.appointmentRepository = appointmentRepository;
        this.mapper = mapper;
    }

    @Transactional
    public void create(BarberUnavailability unavailability) {
        validatePeriod(unavailability.getStartTime(), unavailability.getEndTime());

        if (!barberRepository.existsById(unavailability.getBarberId())) {
            throw new NotFoundException("Barber not found");
        }

        if (repository.existsOverlap(unavailability.getBarberId(), unavailability.getStartTime(), unavailability.getEndTime())) {
            throw new InvalidAppointmentException("Overlapping unavailability");
        }

        if (appointmentRepository.existsOverlapping(unavailability.getBarberId(), unavailability.getStartTime(), unavailability.getEndTime())) {
            throw new InvalidAppointmentException("There are appointments in this period");
        }

        BarberUnavailabilityEntity entity = mapper.toEntity(unavailability);

        entity.setCreatedAt(Instant.now());

        repository.persist(entity);
    }

    @Transactional
    public void delete(Long id) {
        boolean deleted = repository.deleteById(id);

        if (!deleted) {
            throw new NotFoundException("Unavailability not found");
        }
    }

    public List<BarberUnavailability> findByBarber(Long barberId) {
        return repository.findByBarberId(barberId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    public boolean isUnavailable(Long barberId, Instant start, Instant end) {
        return repository.existsOverlap(barberId, start, end);
    }

    private void validatePeriod(Instant start, Instant end) {
        if (!end.isAfter(start)) {
            throw new InvalidAppointmentException("Invalid period");
        }
    }
}
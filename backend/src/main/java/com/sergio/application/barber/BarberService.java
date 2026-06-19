package com.sergio.application.barber;

import com.sergio.domain.barber.Barber;
import com.sergio.domain.barber.exception.BarberDeletionNotAllowedException;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.barber.BarberEntity;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barber.mapper.BarberPersistenceMapper;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class BarberService {

    private final BarberRepository barberRepository;
    private final BarbershopRepository barbershopRepository;
    private final AppointmentRepository appointmentRepository;
    private final BarberPersistenceMapper mapper;

    public BarberService(BarberRepository barberRepository, BarbershopRepository barbershopRepository, AppointmentRepository appointmentRepository, BarberPersistenceMapper mapper) {
        this.barberRepository = barberRepository;
        this.barbershopRepository = barbershopRepository;
        this.appointmentRepository = appointmentRepository;
        this.mapper = mapper;
    }

    // ==========================
    // SHARED
    // ==========================

    public List<Barber> findAll() {
        return barberRepository.listAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    public List<Barber> findAllByBarbershopId(Long barbershopId) {
        return barberRepository.findByBarbershopId(barbershopId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    public Barber findById(Long barberId) {
        return barberRepository.findByIdOptional(barberId)
                .map(mapper::toDomain)
                .orElseThrow(() -> new NotFoundException("Barber not found"));
    }

    public Barber findByIdAndBarbershopId(Long barberId, Long barbershopId) {
        return barberRepository
                .findByIdAndBarbershopId(barberId, barbershopId)
                .map(mapper::toDomain)
                .orElseThrow(() -> new NotFoundException("Barber not found"));
    }

    @Transactional
    public Barber create(Long barbershopId, Barber barber) {
        BarberEntity entity = mapper.toEntity(barber);

        entity.setBarbershopId(barbershopId);
        entity.setCreatedAt(Instant.now());

        barberRepository.persist(entity);

        return mapper.toDomain(entity);
    }

    @Transactional
    public Barber update(Long barberId, Barber barber) {
        BarberEntity entity = barberRepository
                .findByIdOptional(barberId)
                .orElseThrow(() -> new NotFoundException("Barber not found"));

        entity.setName(barber.getName());

        return mapper.toDomain(entity);
    }

    @Transactional
    public void delete(Long barberId) {
        if (appointmentRepository.existsByBarberId(barberId)) {
            throw new BarberDeletionNotAllowedException();
        }

        BarberEntity entity = barberRepository
                .findByIdOptional(barberId)
                .orElseThrow(() -> new NotFoundException("Barber not found"));

        barberRepository.delete(entity);
    }

    // ==========================
    // PUBLIC API
    // ==========================

    public List<Barber> findAllBarbersByBarbershopSlug(String slug) {
        Long barbershopId = getBarbershopIdBySlug(slug);
        return findAllByBarbershopId(barbershopId);
    }

    public Barber findById(String slug, Long barberId) {
        Long barbershopId = getBarbershopIdBySlug(slug);

        return findByIdAndBarbershopId(barberId, barbershopId);
    }

    private Long getBarbershopIdBySlug(String slug) {
        return barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }
}
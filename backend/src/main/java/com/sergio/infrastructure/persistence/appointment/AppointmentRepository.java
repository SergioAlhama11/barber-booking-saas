package com.sergio.infrastructure.persistence.appointment;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class AppointmentRepository implements PanacheRepository<AppointmentEntity> {

    // FINDERS

    public List<AppointmentEntity> findByBarbershopId(Long barbershopId) {
        return list("""
            barbershopId = ?1
            and cancelledAt is null
        """, barbershopId);
    }

    public List<AppointmentEntity> findByBarbershopIdAndEmail(Long barbershopId, String email) {
        return list("""
            barbershopId = ?1
            and customerEmail = ?2
            and cancelledAt is null
        """, barbershopId, email);
    }

    public Optional<AppointmentEntity> findByIdAndBarbershopId(Long barbershopId, Long id) {
        return find("""
            barbershopId = ?1
            and id = ?2
        """, barbershopId, id).firstResultOptional();
    }

    // AVAILABILITY

    public boolean existsOverlapping(Long barberId, LocalDateTime start, LocalDateTime end) {
        return count("""
            barberId = ?1
            and cancelledAt is null
            and startTime < ?2
            and endTime > ?3
        """, barberId, end, start) > 0;
    }

    public boolean existsOverlappingAnyBarber(Long barbershopId, LocalDateTime start, LocalDateTime end) {
        return count("""
            barbershopId = ?1
            and cancelledAt is null
            and startTime < ?2
            and endTime > ?3
        """, barbershopId, end, start) > 0;
    }

    // TOKEN

    public Optional<AppointmentEntity> findActiveByToken(String token) {
        return find("""
            cancelToken = ?1
            and cancelledAt is null
        """, token).firstResultOptional();
    }

    public Optional<AppointmentEntity> findValidToken(String token) {
        return find("""
            cancelToken = ?1
            and cancelledAt is null
            and cancelTokenExpiresAt > ?2
        """, token, Instant.now()).firstResultOptional();
    }
}

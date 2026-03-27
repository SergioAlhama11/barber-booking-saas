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

    public Optional<AppointmentEntity> findByIdAndBarbershopId(Long barbershopId, Long id) {
        return find("""
            barbershopId = ?1
            and id = ?2
        """, barbershopId, id).firstResultOptional();
    }

    public List<AppointmentProjection> findDetailedByBarbershopIdAndEmail(
            Long barbershopId,
            String email,
            int page,
            int size
    ) {
        return getEntityManager().createQuery("""
        SELECT new com.sergio.infrastructure.persistence.appointment.AppointmentProjection(
            a.id,
            a.barbershopId,
            a.barberId,
            a.serviceId,
            b.name,
            s.name,
            a.customerName,
            a.customerEmail,
            a.startTime,
            a.endTime,
            a.cancelledAt
        )
        FROM AppointmentEntity a
        JOIN BarberEntity b ON b.id = a.barberId
        JOIN ServiceEntity s ON s.id = a.serviceId
        WHERE a.barbershopId = :barbershopId
          AND a.customerEmail = :email
        ORDER BY a.startTime DESC
    """, AppointmentProjection.class)
                .setParameter("barbershopId", barbershopId)
                .setParameter("email", email)
                .setFirstResult(page * size) // 🔥 offset
                .setMaxResults(size)         // 🔥 limit
                .getResultList();
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

package com.sergio.infrastructure.persistence.appointment;

import com.sergio.api.admin.appointment.dto.AdminAppointmentFilterRequest;
import com.sergio.domain.appointment.AppointmentStatusFilter;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
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

    public List<AppointmentProjection> findDetailedByBarbershopId(Long barbershopId, int page, int size) {

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
            a.cancelledAt,
            a.source,
            a.calendarVersion
        )
        FROM AppointmentEntity a
        JOIN BarberEntity b ON b.id = a.barberId
        JOIN ServiceEntity s ON s.id = a.serviceId
        WHERE a.barbershopId = :barbershopId
        ORDER BY a.startTime DESC
    """, AppointmentProjection.class)
                .setParameter("barbershopId", barbershopId)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
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
            a.cancelledAt,
            a.source,
            a.calendarVersion
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

    public Optional<AppointmentProjection> findDetailedById(Long barbershopId, Long id) {
        List<AppointmentProjection> result = getEntityManager().createQuery("""
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
            a.cancelledAt,
            a.source,
            a.calendarVersion
        )
        FROM AppointmentEntity a
        JOIN BarberEntity b ON b.id = a.barberId
        JOIN ServiceEntity s ON s.id = a.serviceId
        WHERE a.barbershopId = :barbershopId
          AND a.id = :id
    """, AppointmentProjection.class)
                .setParameter("barbershopId", barbershopId)
                .setParameter("id", id)
                .getResultList();

        return result.stream().findFirst();
    }

    public List<AppointmentProjection> findDetailedByFilters(
            Long barbershopId,
            AdminAppointmentFilterRequest filter
    ) {

        StringBuilder jpql = new StringBuilder("""
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
            a.cancelledAt,
            a.source,
            a.calendarVersion
        )
        FROM AppointmentEntity a
        JOIN BarberEntity b ON b.id = a.barberId
        JOIN ServiceEntity s ON s.id = a.serviceId
        WHERE a.barbershopId = :barbershopId
    """);

        if (filter.from != null) {
            jpql.append(" AND a.startTime >= :from");
        }

        if (filter.to != null) {
            jpql.append(" AND a.startTime <= :to");
        }

        if (filter.barberId != null) {
            jpql.append(" AND a.barberId = :barberId");
        }

        if (filter.status != null) {

            switch (filter.status) {

                case ACTIVE ->
                        jpql.append("""
                    AND a.cancelledAt IS NULL
                    AND a.endTime >= :now
                """);

                case COMPLETED ->
                        jpql.append("""
                    AND a.cancelledAt IS NULL
                    AND a.endTime < :now
                """);

                case CANCELLED ->
                        jpql.append("""
                    AND a.cancelledAt IS NOT NULL
                """);

                case ALL -> {
                }
            }
        }

        if (filter.search != null && !filter.search.isBlank()) {

            jpql.append("""
            AND (
                LOWER(a.customerName) LIKE :search
                OR LOWER(a.customerEmail) LIKE :search
            )
        """);
        }

        jpql.append(" ORDER BY a.startTime DESC");

        var query = getEntityManager()
                .createQuery(jpql.toString(), AppointmentProjection.class)
                .setParameter("barbershopId", barbershopId);

        if (filter.status == AppointmentStatusFilter.ACTIVE
                || filter.status == AppointmentStatusFilter.COMPLETED) {

            query.setParameter("now", Instant.now());
        }

        if (filter.from != null) {
            query.setParameter("from", filter.from);
        }

        if (filter.to != null) {
            query.setParameter("to", filter.to);
        }

        if (filter.barberId != null) {
            query.setParameter("barberId", filter.barberId);
        }

        if (filter.search != null && !filter.search.isBlank()) {
            query.setParameter(
                    "search",
                    "%" + filter.search.toLowerCase() + "%"
            );
        }

        return query
                .setFirstResult(filter.page * filter.size)
                .setMaxResults(filter.size)
                .getResultList();
    }

    // ANTIFRAUDE

    public long countFutureByEmail(Long barbershopId, String email, Instant now) {
        return count("""
            barbershopId = ?1
            and customerEmail = ?2
            and cancelledAt is null
            and startTime > ?3
        """, barbershopId, email, now);
    }

    public boolean existsSameSlot(Long barberId, Instant startTime, String email) {
        return count("""
            barberId = ?1
            and startTime = ?2
            and customerEmail = ?3
            and cancelledAt is null
        """, barberId, startTime, email) > 0;
    }

    public boolean existsSameSlotExcludingId(Long barberId, Instant startTime, String email, Long id) {
        return count("""
        barberId = ?1
        and startTime = ?2
        and customerEmail = ?3
        and id != ?4
        and cancelledAt is null
    """, barberId, startTime, email, id) > 0;
    }

    // AVAILABILITY

    public boolean existsOverlapping(Long barberId, Instant start, Instant end) {
        return count("""
            barberId = ?1
            and cancelledAt is null
            and startTime < ?2
            and endTime > ?3
        """, barberId, end, start) > 0;
    }

    public boolean existsCustomerOverlap(Long barbershopId, String email, Instant start, Instant end) {
        return count("""
            barbershopId = ?1
            and customerEmail = ?2
            and cancelledAt is null
            and startTime < ?3
            and endTime > ?4
        """, barbershopId, email, end, start) > 0;
    }

    public boolean existsCustomerOverlapExcludingId(
            Long barbershopId,
            String email,
            Instant start,
            Instant end,
            Long id
    ) {
        return count("""
            barbershopId = ?1
            and customerEmail = ?2
            and cancelledAt is null
            and id != ?3
            and startTime < ?4
            and endTime > ?5
        """, barbershopId, email, id, end, start) > 0;
    }

    public boolean existsOverlappingAnyBarber(Long barbershopId, Instant start, Instant end) {
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

package com.sergio.infrastructure.persistence.appointment;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class AppointmentRepository implements PanacheRepository<AppointmentEntity> {

    public List<AppointmentEntity> findByBarbershopId(Long barbershopId) {
        return find("barbershopId", barbershopId).list();
    }

    public boolean existsOverlapping(Long barberId, LocalDateTime start, LocalDateTime end) {
        return count("""
            barberId = ?1
            and startTime < ?2
            and endTime > ?3
        """, barberId, end, start) > 0;
    }

    public boolean existsOverlappingAnyBarber(Long barbershopId, LocalDateTime start, LocalDateTime end) {
        return count(
                "barbershopId = ?1 and startTime < ?2 and endTime > ?3",
                barbershopId,
                end,
                start
        ) > 0;
    }
}

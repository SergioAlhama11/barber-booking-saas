package com.sergio.infrastructure.persistence.unavailability;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class BarberUnavailabilityRepository implements PanacheRepository<BarberUnavailabilityEntity> {

    public List<BarberUnavailabilityEntity> findByBarberId(Long barberId) {
        return list("barberId = ?1 order by startTime", barberId);
    }

    public boolean existsOverlap(Long barberId, Instant start, Instant end) {
        return count("barberId = ?1 and startTime < ?3 and endTime > ?2 ", barberId, start, end) > 0;
    }
}

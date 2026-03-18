package com.sergio.infrastructure.persistence.barber;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class BarberRepository implements PanacheRepository<BarberEntity> {

    public List<BarberEntity> findByBarbershopId(Long barbershopId) {
        return list("barbershopId", barbershopId);
    }

    public boolean existsByIdAndBarbershopId(Long barberId, Long barbershopId) {
        return count("id = ?1 and barbershopId = ?2", barberId, barbershopId) > 0;
    }
}

package com.sergio.infrastructure.persistence.barber;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class BarberRepository implements PanacheRepository<BarberEntity> {

    public List<BarberEntity> findByBarbershopId(Long barbershopId) {
        return list("barbershopId", barbershopId);
    }

    public Optional<BarberEntity> findByIdAndBarbershopId(Long barberId, Long barbershopId) {
        return find("id = ?1 and barbershopId = ?2", barberId, barbershopId).firstResultOptional();
    }

    public Optional<BarberEntity> findByNameAndBarbershopId(String name, Long barbershopId) {
        return find("name = ?1 and barbershopId = ?2", name, barbershopId).firstResultOptional();
    }

    public boolean existsById(Long id) {
        return count("id", id) > 0;
    }

    public boolean existsByBarbershopId(Long barbershopId) {
        return count("barbershopId", barbershopId) > 0;
    }

    public boolean existsByIdAndBarbershopId(Long barberId, Long barbershopId) {
        return count("id = ?1 and barbershopId = ?2", barberId, barbershopId) > 0;
    }

    public boolean existsByNameAndBarbershopId(String name, Long barbershopId) {
        return count("name = ?1 and barbershopId = ?2", name, barbershopId) > 0;
    }
}

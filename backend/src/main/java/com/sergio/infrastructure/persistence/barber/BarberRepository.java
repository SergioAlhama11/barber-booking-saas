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

    public boolean existsByIdAndBarbershopId(Long barberId, Long barbershopId) {
        return count("id = ?1 and barbershopId = ?2", barberId, barbershopId) > 0;
    }

    public Optional<String> findNameById(Long id) {
        return find("select b.name from BarberEntity b where b.id = ?1", id)
                .project(String.class)
                .firstResultOptional();
    }
}

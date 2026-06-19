package com.sergio.infrastructure.persistence.service;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ServiceRepository implements PanacheRepository<ServiceEntity> {

    public List<ServiceEntity> findByBarbershopId(Long barbershopId) {
        return find("barbershopId", barbershopId).list();
    }

    public Optional<ServiceEntity> findByIdAndBarbershopId(Long serviceId, Long barbershopId) {
        return find("id = ?1 and barbershopId = ?2", serviceId, barbershopId).firstResultOptional();
    }

    public Optional<ServiceEntity> findByNameAndBarbershopId(String name, Long barbershopId) {
        return find("name = ?1 and barbershopId = ?2", name, barbershopId).firstResultOptional();
    }

    public boolean existsByNameAndBarbershopId(String name, Long barbershopId) {
        return count("name = ?1 and barbershopId = ?2", name, barbershopId) > 0;
    }

    public boolean existsByIdAndBarbershopId(Long barberId, Long barbershopId) {
        return count("id = ?1 and barbershopId = ?2", barberId, barbershopId) > 0;
    }
}

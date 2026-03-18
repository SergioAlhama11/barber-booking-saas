package com.sergio.infrastructure.persistence.service;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ServiceRepository implements PanacheRepository<ServiceEntity> {

    public List<ServiceEntity> findByBarbershopId(Long barbershopId) {
        return find("barbershopId", barbershopId).list();
    }

    public boolean existsByNameAndBarbershopId(String name, Long barbershopId) {
        return count("name = ?1 and barbershopId = ?2", name, barbershopId) > 0;
    }
}

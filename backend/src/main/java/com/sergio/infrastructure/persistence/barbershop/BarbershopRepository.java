package com.sergio.infrastructure.persistence.barbershop;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class BarbershopRepository implements PanacheRepository<BarbershopEntity> {

    public Optional<BarbershopEntity> findBySlug(String slug) {
        return find("slug", slug).firstResultOptional();
    }
}

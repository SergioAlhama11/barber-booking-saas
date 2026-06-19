package com.sergio.application.scheduling;

import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class BarbershopLookupService {

    private final BarbershopRepository repository;

    public BarbershopLookupService(BarbershopRepository repository) {
        this.repository = repository;
    }

    public Long getIdOrThrow(String slug) {
        return repository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }
}

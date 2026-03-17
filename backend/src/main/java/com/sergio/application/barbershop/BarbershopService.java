package com.sergio.application.barbershop;

import com.sergio.common.util.SlugUtils;
import com.sergio.domain.barbershop.Barbershop;
import com.sergio.domain.barbershop.exception.DuplicateBarbershopException;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import com.sergio.infrastructure.persistence.barbershop.mapper.BarbershopPersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class BarbershopService {

    @Inject
    BarbershopRepository barbershopRepository;

    @Inject
    BarbershopPersistenceMapper mapper;

    public List<Barbershop> findAll() {
        return barbershopRepository.listAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    public Barbershop findBySlug(String slug) {
        BarbershopEntity entity = barbershopRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
        return mapper.toDomain(entity);
    }

    @Transactional
    public Barbershop create(Barbershop barbershop) {
        String slug = generateUniqueSlug(barbershop.getName());
        barbershop.setSlug(slug);

        BarbershopEntity entity = mapper.toEntity(barbershop);
        entity.setCreatedAt(Instant.now());
        try {
            barbershopRepository.persist(entity);
        } catch (PersistenceException e) {
            if (isUniqueConstraintViolation(e)) {
                throw new DuplicateBarbershopException(slug);
            }
            throw e;
        }

        return mapper.toDomain(entity);
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = SlugUtils.toSlug(name);
        String slug = baseSlug;
        int counter = 2;

        while (barbershopRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    private boolean isUniqueConstraintViolation(Throwable e) {
        Throwable cause = e;
        while (cause != null) {
            if (cause instanceof org.postgresql.util.PSQLException psqlEx) {
                return "23505".equals(psqlEx.getSQLState()); // UNIQUE violation
            }
            cause = cause.getCause();
        }
        return false;
    }
}

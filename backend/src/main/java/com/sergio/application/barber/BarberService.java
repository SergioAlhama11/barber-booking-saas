package com.sergio.application.barber;

import com.sergio.domain.barber.Barber;
import com.sergio.infrastructure.persistence.barber.BarberEntity;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barber.mapper.BarberPersistenceMapper;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class BarberService {

    @Inject
    BarberRepository barberRepository;

    @Inject
    BarbershopRepository barbershopRepository;

    @Inject
    BarberPersistenceMapper barberPersistenceMapper;

    public List<Barber> findAllBarbersByBarbershopSlug(String slug) {

        BarbershopEntity barbershopEntity = barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));

        return barberRepository.find("barbershopId", barbershopEntity.getId())
                .list()
                .stream()
                .map(barberPersistenceMapper::toDomain)
                .toList();
    }

    public Barber findById(String slug, Long barberId) {
        BarbershopEntity barbershopEntity = barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));

        BarberEntity barberEntity = barberRepository
                .find("id = ?1 and barbershopId = ?2", barberId, barbershopEntity.getId())
                .firstResult();

        if (barberEntity == null) {
            throw new NotFoundException("Barber not found");
        }

        return barberPersistenceMapper.toDomain(barberEntity);
    }

    @Transactional
    public Barber create(String slug, Barber barber) {

        BarbershopEntity barbershopEntity = barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));

        BarberEntity barberEntity = barberPersistenceMapper.toEntity(barber);
        barberEntity.setBarbershopId(barbershopEntity.getId());
        barberEntity.setCreatedAt(Instant.now());

        barberRepository.persist(barberEntity);

        return barberPersistenceMapper.toDomain(barberEntity);
    }
}

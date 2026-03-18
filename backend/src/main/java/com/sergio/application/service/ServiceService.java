package com.sergio.application.service;

import com.sergio.domain.service.Service;
import com.sergio.domain.service.exception.DuplicateServiceException;
import com.sergio.domain.service.exception.InvalidServiceException;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import com.sergio.infrastructure.persistence.service.ServiceEntity;
import com.sergio.infrastructure.persistence.service.ServiceRepository;
import com.sergio.infrastructure.persistence.service.mapper.ServicePersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class ServiceService {

    @Inject
    ServiceRepository serviceRepository;

    @Inject
    BarbershopRepository barbershopRepository;

    @Inject
    ServicePersistenceMapper servicePersistenceMapper;

    public List<Service> findAll(String slug) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        return serviceRepository.findByBarbershopId(barbershopId)
                .stream()
                .map(servicePersistenceMapper::toDomain)
                .toList();
    }

    public Service findById(String slug, Long id) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        ServiceEntity entity = serviceRepository
                .find("id = ?1 and barbershopId = ?2", id, barbershopId)
                .firstResult();

        if (entity == null) {
            throw new NotFoundException("Service not found");
        }

        return servicePersistenceMapper.toDomain(entity);
    }

    @Transactional
    public Service create(String slug, Service service) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        if (service.getDurationMinutes() < 20 || service.getDurationMinutes() > 40) {
            throw new InvalidServiceException("Duration must be between 20 and 40 minutes");
        }

        if (serviceRepository.existsByNameAndBarbershopId(service.getName(), barbershopId)) {
            throw new DuplicateServiceException("Service already exists");
        }

        ServiceEntity entity = servicePersistenceMapper.toEntity(service);
        entity.setBarbershopId(barbershopId);
        entity.setCreatedAt(Instant.now());

        serviceRepository.persist(entity);

        return servicePersistenceMapper.toDomain(entity);
    }

    private Long getBarbershopIdOrThrow(String slug) {
        BarbershopEntity barbershop = barbershopRepository.find("slug", slug).firstResult();

        if (barbershop == null) {
            throw new NotFoundException("Barbershop not found");
        }

        return barbershop.getId();
    }
}

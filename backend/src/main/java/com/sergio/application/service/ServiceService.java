package com.sergio.application.service;

import com.sergio.domain.service.Service;
import com.sergio.domain.service.exception.DuplicateServiceException;
import com.sergio.domain.service.exception.InvalidServiceException;
import com.sergio.domain.service.exception.ServiceDeletionNotAllowedException;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import com.sergio.infrastructure.persistence.service.ServiceEntity;
import com.sergio.infrastructure.persistence.service.ServiceRepository;
import com.sergio.infrastructure.persistence.service.mapper.ServicePersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class ServiceService {

    private static final Logger LOG = Logger.getLogger(ServiceService.class);

    private final ServiceRepository serviceRepository;
    private final BarbershopRepository barbershopRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServicePersistenceMapper servicePersistenceMapper;

    public ServiceService(ServiceRepository serviceRepository, BarbershopRepository barbershopRepository, AppointmentRepository appointmentRepository, ServicePersistenceMapper servicePersistenceMapper) {
        this.serviceRepository = serviceRepository;
        this.barbershopRepository = barbershopRepository;
        this.appointmentRepository = appointmentRepository;
        this.servicePersistenceMapper = servicePersistenceMapper;
    }

    // ==========================
    // API ADMIN / REUTILIZABLE
    // ==========================

    public List<Service> findAll() {
        return serviceRepository.listAll()
                .stream()
                .map(servicePersistenceMapper::toDomain)
                .toList();
    }

    public List<Service> findAllByBarbershopId(Long barbershopId) {

        return serviceRepository.findByBarbershopId(barbershopId)
                .stream()
                .map(servicePersistenceMapper::toDomain)
                .toList();
    }

    public Service findById(Long serviceId) {
        ServiceEntity entity = serviceRepository
                .findByIdOptional(serviceId)
                .orElseThrow(() -> new NotFoundException("Service not found"));

        return servicePersistenceMapper.toDomain(entity);
    }

    public Service findById(Long barbershopId, Long serviceId) {
        if (!serviceRepository.existsByIdAndBarbershopId(serviceId, barbershopId)) {
            throw new NotFoundException("Service not found");
        }

        return findById(serviceId);
    }

    @Transactional
    public Service create(Long barbershopId, Service service) {

        LOG.infof(
                "service_create_requested barbershopId=%d name=%s duration=%d",
                barbershopId,
                service.getName(),
                service.getDurationMinutes()
        );

        validateCreate(service, barbershopId);

        ServiceEntity entity = servicePersistenceMapper.toEntity(service);

        entity.setBarbershopId(barbershopId);
        entity.setCreatedAt(Instant.now());

        serviceRepository.persist(entity);

        LOG.infof(
                "service_created barbershopId=%d serviceId=%d name=%s",
                barbershopId,
                entity.getId(),
                entity.getName()
        );

        return servicePersistenceMapper.toDomain(entity);
    }

    @Transactional
    public Service update(Long serviceId, Service service) {

        ServiceEntity entity = serviceRepository
                .findByIdOptional(serviceId)
                .orElseThrow(() -> new NotFoundException("Service not found"));

        validateUpdate(service, entity.getBarbershopId(), entity.getId());

        entity.setName(service.getName());
        entity.setDurationMinutes(service.getDurationMinutes());
        entity.setPrice(service.getPrice());

        return servicePersistenceMapper.toDomain(entity);
    }

    @Transactional
    public void delete(Long serviceId) {

        if (appointmentRepository.existsByServiceId(serviceId)) {
            throw new ServiceDeletionNotAllowedException();
        }

        ServiceEntity entity = serviceRepository
                .findByIdOptional(serviceId)
                .orElseThrow(() -> new NotFoundException("Service not found"));

        serviceRepository.delete(entity);
    }

    // ==========================
    // API PUBLICA
    // ==========================

    public List<Service> findAll(String slug) {

        LOG.infof(
                "services_fetch_requested slug=%s",
                slug
        );

        Long barbershopId = getBarbershopIdOrThrow(slug);

        return findAllByBarbershopId(barbershopId);
    }

    public Service findById(String slug, Long serviceId) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        return findById(barbershopId, serviceId);
    }

    // ==========================
    // VALIDATION
    // ==========================

    private void validateCreate(Service service, Long barbershopId) {
        validateBasicFields(service);

        if (serviceRepository.existsByNameAndBarbershopId(service.getName(), barbershopId)) {
            throw new DuplicateServiceException("Service already exists");
        }
    }

    private void validateUpdate(Service service, Long barbershopId, Long currentServiceId) {
        validateBasicFields(service);

        ServiceEntity existing = serviceRepository
                .findByNameAndBarbershopId(service.getName(), barbershopId)
                .orElse(null);

        if (existing != null && !existing.getId().equals(currentServiceId)) {
            throw new DuplicateServiceException("Service already exists");
        }
    }

    private void validateBasicFields(Service service) {

        if (service.getName() == null || service.getName().isBlank()) {
            throw new InvalidServiceException("Name is required");
        }

        if (service.getDurationMinutes() == null || service.getDurationMinutes() < 20 || service.getDurationMinutes() > 40) {
            throw new InvalidServiceException("Duration must be between 20 and 40 minutes");
        }

        if (service.getPrice() == null) {
            throw new InvalidServiceException("Price is required");
        }

        if (service.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidServiceException("Price must be greater than 0");
        }

        service.setPrice(service.getPrice().setScale(2, RoundingMode.HALF_UP));
    }

    // ==========================
    // HELPERS
    // ==========================

    private Long getBarbershopIdOrThrow(String slug) {
        return barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }
}
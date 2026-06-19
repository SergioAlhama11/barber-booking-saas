package com.sergio.application.admin.authorization;

import com.sergio.application.admin.auth.AuthenticatedAdmin;
import com.sergio.domain.admin.AdminRole;
import com.sergio.infrastructure.persistence.barber.BarberEntity;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import com.sergio.infrastructure.persistence.service.ServiceRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AdminOwnershipService {

    private final BarberRepository barberRepository;
    private final ServiceRepository serviceRepository;
    private final BarbershopRepository barbershopRepository;

    public AdminOwnershipService(BarberRepository barberRepository, ServiceRepository serviceRepository, BarbershopRepository barbershopRepository) {
        this.barberRepository = barberRepository;
        this.serviceRepository = serviceRepository;
        this.barbershopRepository = barbershopRepository;
    }

    public void validateBarbershopExists(Long barbershopId) {
        if (!barbershopRepository.existsById(barbershopId)) {
            throw new IllegalArgumentException("Barbershop does not exist");
        }
    }

    public void validateBarberExists(Long barberId) {
        if (!barberRepository.existsById(barberId)) {
            throw new IllegalArgumentException("Barber does not exist");
        }
    }

    public void validateBarberOwnership(Long barbershopId, Long barberId) {
        if (!barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
            throw new IllegalArgumentException("Barber does not belong to barbershop");
        }
    }

    public void validateServiceOwnership(Long barbershopId, Long serviceId) {
        if (!serviceRepository.existsByIdAndBarbershopId(serviceId, barbershopId)) {
            throw new IllegalArgumentException("Service does not belong to barbershop");
        }
    }

    public Long resolveBarbershopForCreation(AuthenticatedAdmin admin, Long barberId) {

        if (!admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            validateBarberOwnership(admin.barbershopId(), barberId);
            return admin.barbershopId();
        }

        return barberRepository.findByIdOptional(barberId)
                .map(BarberEntity::getBarbershopId)
                .orElseThrow(() -> new IllegalArgumentException("Barber does not exist"));
    }
}
package com.sergio.application.admin.service;

import com.sergio.application.admin.auth.AuthenticatedAdmin;
import com.sergio.application.admin.authorization.AdminOwnershipService;
import com.sergio.application.service.ServiceService;
import com.sergio.domain.admin.AdminRole;
import com.sergio.domain.service.Service;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;

import java.util.List;

@ApplicationScoped
public class AdminServiceService {

    private final ServiceService serviceService;
    private final AdminOwnershipService ownershipService;

    public AdminServiceService(ServiceService serviceService, AdminOwnershipService ownershipService) {
        this.serviceService = serviceService;
        this.ownershipService = ownershipService;
    }

    public List<Service> findAll(AuthenticatedAdmin admin, Long requestedBarbershopId) {

        if (admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            if (requestedBarbershopId == null) {
                return serviceService.findAll();
            }

            ownershipService.validateBarbershopExists(requestedBarbershopId);
            return serviceService.findAllByBarbershopId(requestedBarbershopId);
        }

        return serviceService.findAllByBarbershopId(admin.barbershopId()
        );
    }

    public Service findById(AuthenticatedAdmin admin, Long serviceId) {

        if (admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            return serviceService.findById(serviceId);
        }

        ownershipService.validateServiceOwnership(admin.barbershopId(), serviceId);
        return serviceService.findById(serviceId);
    }

    public Service create(AuthenticatedAdmin admin, Long requestedBarbershopId, Service service) {

        Long effectiveBarbershopId;

        if (admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {

            if (requestedBarbershopId == null) {
                throw new BadRequestException("Barbershop is required");
            }

            effectiveBarbershopId = requestedBarbershopId;

        } else {
            effectiveBarbershopId = admin.barbershopId();
        }

        return serviceService.create(effectiveBarbershopId, service);
    }

    public Service update(AuthenticatedAdmin admin, Long serviceId, Service service) {
        Service existing = findById(admin, serviceId);
        return serviceService.update(existing.getId(), service);
    }

    public void delete(AuthenticatedAdmin admin, Long serviceId) {
        findById(admin, serviceId);
        serviceService.delete(serviceId);
    }
}

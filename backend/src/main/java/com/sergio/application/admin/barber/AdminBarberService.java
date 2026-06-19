package com.sergio.application.admin.barber;

import com.sergio.application.admin.auth.AuthenticatedAdmin;
import com.sergio.application.admin.authorization.AdminOwnershipService;
import com.sergio.application.barber.BarberService;
import com.sergio.domain.admin.AdminRole;
import com.sergio.domain.barber.Barber;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;

import java.util.List;

@ApplicationScoped
public class AdminBarberService {

    private final BarberService barberService;
    private final AdminOwnershipService ownershipService;

    public AdminBarberService(BarberService barberService, AdminOwnershipService ownershipService) {
        this.barberService = barberService;
        this.ownershipService = ownershipService;
    }

    public List<Barber> findAll(AuthenticatedAdmin admin, Long requestedBarbershopId) {
        if (admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            if (requestedBarbershopId == null) {
                return barberService.findAll();
            }

            ownershipService.validateBarbershopExists(requestedBarbershopId);

            return barberService.findAllByBarbershopId(requestedBarbershopId);
        }

        return barberService.findAllByBarbershopId(admin.barbershopId());
    }

    public Barber findById(AuthenticatedAdmin admin, Long barberId) {
        if (admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            return barberService.findById(barberId);
        }

        return barberService.findByIdAndBarbershopId(barberId, admin.barbershopId());
    }

    public Barber create(AuthenticatedAdmin admin, Long requestedBarbershopId, Barber barber) {
        Long effectiveBarbershopId;

        if (admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            if (requestedBarbershopId == null) {
                throw new BadRequestException("Barbershop is required");
            }

            effectiveBarbershopId = requestedBarbershopId;

        } else {
            effectiveBarbershopId = admin.barbershopId();
        }

        return barberService.create(effectiveBarbershopId, barber);
    }

    public Barber update(AuthenticatedAdmin admin, Long barberId, Barber barber) {
        Barber existing = findById(admin, barberId);
        return barberService.update(existing.getId(), barber);
    }

    public void delete(AuthenticatedAdmin admin, Long barberId) {
        findById(admin, barberId);
        barberService.delete(barberId);
    }
}
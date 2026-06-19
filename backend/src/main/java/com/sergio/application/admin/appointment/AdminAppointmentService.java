package com.sergio.application.admin.appointment;

import com.sergio.api.admin.appointment.dto.AdminAppointmentFilterRequest;
import com.sergio.application.admin.auth.AuthenticatedAdmin;
import com.sergio.application.admin.authorization.AdminOwnershipService;
import com.sergio.application.appointment.AppointmentService;
import com.sergio.domain.admin.AdminRole;
import com.sergio.domain.appointment.Appointment;
import com.sergio.infrastructure.persistence.appointment.AppointmentEntity;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.appointment.mapper.AppointmentPersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
public class AdminAppointmentService {

    private final AdminOwnershipService ownershipService;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;
    private final AppointmentPersistenceMapper mapper;

    public AdminAppointmentService(AdminOwnershipService ownershipService, AppointmentRepository appointmentRepository, AppointmentService appointmentService, AppointmentPersistenceMapper mapper) {
        this.ownershipService = ownershipService;
        this.appointmentRepository = appointmentRepository;
        this.appointmentService = appointmentService;
        this.mapper = mapper;
    }

    public List<Appointment> findAll(AuthenticatedAdmin admin, AdminAppointmentFilterRequest filter) {
        Long effectiveBarbershopId = resolveEffectiveBarbershopId(admin, filter.barbershopId);
        Long effectiveBarberId = resolveEffectiveBarberId(admin, effectiveBarbershopId, filter.barberId);

        return appointmentRepository
                .findDetailedByFilters(effectiveBarbershopId, filter, effectiveBarberId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    public Appointment findById(AuthenticatedAdmin admin, Long appointmentId) {

        AppointmentEntity entity = appointmentRepository
                .findByIdOptional(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        validateAccess(admin, entity);

        return appointmentRepository
                .findDetailedById(entity.getBarbershopId(), entity.getId())
                .map(mapper::toDomain)
                .orElseThrow();
    }

    public Appointment create(AuthenticatedAdmin admin, Appointment request) {
        Long barbershopId = ownershipService.resolveBarbershopForCreation(admin, request.getBarberId());

        return appointmentService.createByAdmin(barbershopId, request);
    }

    public Appointment update(AuthenticatedAdmin admin, Long appointmentId, Appointment request) {
        Appointment existing = findById(admin, appointmentId);

        ownershipService.validateBarberOwnership(existing.getBarbershopId(), request.getBarberId());

        return appointmentService.updateByAdmin(existing.getId(), request);
    }

    public void cancel(AuthenticatedAdmin admin, Long appointmentId) {
        Appointment appointment = findById(admin, appointmentId);
        appointmentService.cancelByAdmin(appointment.getId());
    }

    private Long resolveEffectiveBarbershopId(AuthenticatedAdmin admin, Long requestedBarbershopId) {
        if (!admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            return admin.barbershopId();
        }

        if (requestedBarbershopId != null) {
            ownershipService.validateBarbershopExists(requestedBarbershopId);
        }

        return requestedBarbershopId;
    }

    private Long resolveEffectiveBarberId(AuthenticatedAdmin admin, Long effectiveBarbershopId, Long requestedBarberId) {
        if (admin.roles().contains(AdminRole.BARBER.name())) {
            if (admin.barberId() == null) {
                throw new IllegalStateException("BARBER user without barberId");
            }

            return admin.barberId();
        }

        if (requestedBarberId != null) {
            ownershipService.validateBarberExists(requestedBarberId);
            if (effectiveBarbershopId != null) {
                ownershipService.validateBarberOwnership(effectiveBarbershopId, requestedBarberId);
            }
        }

        return requestedBarberId;
    }

    private void validateAccess(AuthenticatedAdmin admin, AppointmentEntity entity) {

        if (admin.roles().contains(AdminRole.SUPER_ADMIN.name())) {
            return;
        }

        if (admin.roles().contains(AdminRole.BARBER.name())) {

            if (!entity.getBarberId().equals(admin.barberId())) {
                throw new ForbiddenException("Access denied");
            }

            return;
        }

        if (!entity.getBarbershopId().equals(admin.barbershopId())) {
            throw new ForbiddenException("Access denied");
        }
    }
}

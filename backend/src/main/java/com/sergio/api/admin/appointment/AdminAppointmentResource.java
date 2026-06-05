package com.sergio.api.admin.appointment;

import com.sergio.api.admin.appointment.dto.AdminAppointmentFilterRequest;
import com.sergio.api.admin.appointment.dto.AdminAppointmentResponse;
import com.sergio.api.admin.appointment.mapper.AdminAppointmentMapper;
import com.sergio.application.admin.appointment.AdminAppointmentService;
import com.sergio.application.admin.auth.AuthenticatedAdmin;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/admin/appointments")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({"OWNER", "BARBER"})
public class AdminAppointmentResource {

    private final AdminAppointmentService adminAppointmentService;
    private final AdminAppointmentMapper mapper;
    private final AuthenticatedAdmin admin;

    public AdminAppointmentResource(
            AdminAppointmentService adminAppointmentService,
            AdminAppointmentMapper mapper,
            AuthenticatedAdmin admin
    ) {
        this.adminAppointmentService = adminAppointmentService;
        this.mapper = mapper;
        this.admin = admin;
    }

    @GET
    public List<AdminAppointmentResponse> getAll(
            @BeanParam AdminAppointmentFilterRequest filter
    ) {

        return adminAppointmentService.findAll(
                        admin.barbershopId(),
                        filter
                )
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
package com.sergio.api.admin.appointment;

import com.sergio.api.admin.appointment.dto.AdminAppointmentFilterRequest;
import com.sergio.api.admin.appointment.dto.AdminAppointmentResponse;
import com.sergio.api.admin.appointment.dto.AdminCreateAppointmentRequest;
import com.sergio.api.admin.appointment.dto.AdminUpdateAppointmentRequest;
import com.sergio.api.admin.appointment.mapper.AdminAppointmentMapper;
import com.sergio.application.admin.appointment.AdminAppointmentService;
import com.sergio.application.admin.auth.AuthenticatedAdmin;
import com.sergio.domain.appointment.Appointment;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.net.URI;
import java.util.List;

@Path("/admin/appointments")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({"SUPER_ADMIN", "OWNER", "BARBER"})
public class AdminAppointmentResource {

    private final AdminAppointmentService adminAppointmentService;
    private final AdminAppointmentMapper mapper;
    private final AuthenticatedAdmin admin;

    public AdminAppointmentResource(AdminAppointmentService adminAppointmentService, AdminAppointmentMapper mapper, AuthenticatedAdmin admin) {
        this.adminAppointmentService = adminAppointmentService;
        this.mapper = mapper;
        this.admin = admin;
    }

    @GET
    public List<AdminAppointmentResponse> getAll(@BeanParam @Valid AdminAppointmentFilterRequest filter) {

        return adminAppointmentService.findAll(admin, filter)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public AdminAppointmentResponse findById(@PathParam("id") Long id) {
        return mapper.toDto(adminAppointmentService.findById(admin, id));
    }

    @POST
    public Response create(@Valid AdminCreateAppointmentRequest request, @Context UriInfo uriInfo) {
        Appointment appointment = adminAppointmentService.create(admin, mapper.toDomain(request));
        URI location = uriInfo.getAbsolutePathBuilder()
                .path(String.valueOf(appointment.getId()))
                .build();

        return Response.created(location)
                .entity(mapper.toDto(appointment))
                .build();

    }

    @PUT
    @Path("/{id}")
    public AdminAppointmentResponse update(@PathParam("id") Long id, @Valid AdminUpdateAppointmentRequest request) {
        return mapper.toDto(adminAppointmentService.update(admin, id, mapper.toDomain(request)));
    }

    @DELETE
    @Path("/{id}")
    public Response cancel(@PathParam("id") Long id) {
        adminAppointmentService.cancel(admin, id);
        return Response.noContent().build();
    }
}

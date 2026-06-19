package com.sergio.api.admin.barber;

import com.sergio.api.barber.dto.BarberResponse;
import com.sergio.api.barber.dto.CreateBarberRequest;
import com.sergio.api.barber.dto.UpdateBarberRequest;
import com.sergio.api.barber.mapper.BarberMapper;
import com.sergio.application.admin.auth.AuthenticatedAdmin;
import com.sergio.application.admin.barber.AdminBarberService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/admin/barbers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"SUPER_ADMIN", "OWNER"})
public class AdminBarberResource {

    private final AdminBarberService service;
    private final BarberMapper mapper;
    private final AuthenticatedAdmin admin;

    public AdminBarberResource(AdminBarberService service, BarberMapper mapper, AuthenticatedAdmin admin) {
        this.service = service;
        this.mapper = mapper;
        this.admin = admin;
    }

    @GET
    public List<BarberResponse> findAll(@QueryParam("barbershopId") Long barbershopId) {
        return service.findAll(admin, barbershopId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public BarberResponse findById(@PathParam("id") Long id) {
        return mapper.toDto(service.findById(admin, id));
    }

    @POST
    public BarberResponse create(@Valid CreateBarberRequest request) {
        return mapper.toDto(service.create(admin, request.barbershopId(), mapper.toDomain(request)));
    }

    @PUT
    @Path("/{id}")
    public BarberResponse update(@PathParam("id") Long id, @Valid UpdateBarberRequest request) {
        return mapper.toDto(service.update(admin, id, mapper.toDomain(request)));
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {
        service.delete(admin, id);
    }
}
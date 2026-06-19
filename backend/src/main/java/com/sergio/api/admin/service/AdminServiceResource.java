package com.sergio.api.admin.service;

import com.sergio.api.service.dto.CreateServiceRequest;
import com.sergio.api.service.dto.ServiceResponse;
import com.sergio.api.service.dto.UpdateServiceRequest;
import com.sergio.api.service.mapper.ServiceMapper;
import com.sergio.application.admin.auth.AuthenticatedAdmin;
import com.sergio.application.admin.service.AdminServiceService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/admin/services")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"SUPER_ADMIN", "OWNER"})
public class AdminServiceResource {

    private final AdminServiceService service;
    private final ServiceMapper mapper;
    private final AuthenticatedAdmin admin;

    public AdminServiceResource(AdminServiceService service, ServiceMapper mapper, AuthenticatedAdmin admin) {
        this.service = service;
        this.mapper = mapper;
        this.admin = admin;
    }

    @GET
    public List<ServiceResponse> findAll(@QueryParam("barbershopId") Long barbershopId) {
        return service.findAll(admin, barbershopId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public ServiceResponse findById(@PathParam("id") Long id) {
        return mapper.toDto(service.findById(admin, id));
    }

    @POST
    public ServiceResponse create(@Valid CreateServiceRequest request) {
        return mapper.toDto(service.create(admin, request.barbershopId(), mapper.toDomain(request)));
    }

    @PUT
    @Path("/{id}")
    public ServiceResponse update(@PathParam("id") Long id, @Valid UpdateServiceRequest request) {
        return mapper.toDto(service.update(admin, id, mapper.toDomain(request)));
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {
        service.delete(admin, id);
    }
}
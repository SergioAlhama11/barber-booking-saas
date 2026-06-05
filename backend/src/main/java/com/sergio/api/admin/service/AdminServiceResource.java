package com.sergio.api.admin.service;

import com.sergio.api.service.dto.CreateServiceRequest;
import com.sergio.api.service.dto.ServiceResponse;
import com.sergio.api.service.mapper.ServiceMapper;
import com.sergio.application.service.ServiceService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/admin/barbershops/{slug}/services")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"SUPER_ADMIN", "OWNER"})
public class AdminServiceResource {

    private final ServiceService serviceService;
    private final ServiceMapper mapper;

    public AdminServiceResource(
            ServiceService serviceService,
            ServiceMapper mapper
    ) {
        this.serviceService = serviceService;
        this.mapper = mapper;
    }

    @GET
    public List<ServiceResponse> findAll(@PathParam("slug") String slug) {
        return serviceService.findAll(slug)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public ServiceResponse findById(@PathParam("slug") String slug, @PathParam("id") Long id) {
        return mapper.toDto(serviceService.findById(slug, id));
    }

    @POST
    public ServiceResponse create(@PathParam("slug") String slug, @Valid CreateServiceRequest request) {
        return mapper.toDto(serviceService.create(slug, mapper.toDomain(request)));
    }
}

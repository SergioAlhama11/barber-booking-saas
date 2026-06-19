package com.sergio.api.service;

import com.sergio.api.service.dto.ServiceResponse;
import com.sergio.api.service.mapper.ServiceMapper;
import com.sergio.application.service.ServiceService;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;


@Path("/barbershops/{slug}/services")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ServiceResource {

    @Inject
    ServiceService serviceService;

    @Inject
    ServiceMapper mapper;

    @GET
    public List<ServiceResponse> getAll(@PathParam("slug") @NotBlank String slug) {
        return serviceService.findAll(slug)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public ServiceResponse getById(
            @PathParam("slug") @NotBlank String slug,
            @PathParam("id") Long id) {

        return mapper.toDto(serviceService.findById(slug, id));
    }
}

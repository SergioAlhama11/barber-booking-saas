package com.sergio.api.service;

import com.sergio.api.service.dto.CreateServiceRequest;
import com.sergio.api.service.dto.ServiceResponse;
import com.sergio.api.service.mapper.ServiceMapper;
import com.sergio.application.service.ServiceService;
import com.sergio.domain.service.Service;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
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

    @POST
    public Response create(
            @PathParam("slug") @NotBlank String slug,
            @Valid CreateServiceRequest request) {

        Service created = serviceService.create(slug, mapper.toDomain(request));

        URI location = URI.create(String.format(
                "/barbershops/%s/services/%d",
                slug,
                created.getId()
        ));

        return Response.created(location).entity(mapper.toDto(created)).build();
    }
}

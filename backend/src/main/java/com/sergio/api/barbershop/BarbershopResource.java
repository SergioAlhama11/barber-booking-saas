package com.sergio.api.barbershop;

import com.sergio.api.barbershop.dto.BarbershopResponse;
import com.sergio.api.barbershop.dto.CreateBarbershopRequest;
import com.sergio.api.barbershop.mapper.BarbershopMapper;
import com.sergio.application.barbershop.BarbershopService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/barbershops")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BarbershopResource {

    @Inject
    BarbershopService barbershopService;

    @Inject
    BarbershopMapper barbershopMapper;

    @GET
    public List<BarbershopResponse> findAll() {
        return barbershopService.findAll()
                .stream()
                .map(barbershopMapper::toDto)
                .toList();
    }

    @GET
    @Path("/{slug}")
    public BarbershopResponse findBySlug(@PathParam("slug") String slug) {
        return barbershopMapper.toDto(barbershopService.findBySlug(slug));
    }

    @POST
    public BarbershopResponse create(@Valid CreateBarbershopRequest request) {
        return barbershopMapper.toDto(barbershopService.create(barbershopMapper.toDomain(request)));
    }
}

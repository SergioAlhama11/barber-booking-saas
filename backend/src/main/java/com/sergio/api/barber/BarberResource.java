package com.sergio.api.barber;

import com.sergio.api.barber.dto.BarberResponse;
import com.sergio.api.barber.dto.CreateBarberRequest;
import com.sergio.api.barber.mapper.BarberMapper;
import com.sergio.application.barber.BarberService;
import com.sergio.domain.barber.Barber;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.util.List;

@Path("/barbershops/{slug}/barbers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BarberResource {

    @Inject
    BarberService barberService;

    @Inject
    BarberMapper barberMapper;

    @GET
    public List<BarberResponse> getAll(
            @PathParam("slug") @NotBlank String slug) {

        return barberService.findAllBarbersByBarbershopSlug(slug)
                .stream()
                .map(barberMapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public BarberResponse getById(
            @PathParam("slug") @NotBlank String slug,
            @PathParam("id") Long id) {

        return barberMapper.toDto(barberService.findById(slug, id));
    }
}

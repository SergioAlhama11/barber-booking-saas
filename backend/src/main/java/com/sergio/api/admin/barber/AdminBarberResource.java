package com.sergio.api.admin.barber;

import com.sergio.api.barber.dto.BarberResponse;
import com.sergio.api.barber.dto.CreateBarberRequest;
import com.sergio.api.barber.mapper.BarberMapper;
import com.sergio.application.barber.BarberService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/admin/barbershops/{slug}/barbers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"SUPER_ADMIN", "OWNER"})
public class AdminBarberResource {

    private final BarberService barberService;
    private final BarberMapper barberMapper;

    public AdminBarberResource(
            BarberService barberService,
            BarberMapper barberMapper
    ) {
        this.barberService = barberService;
        this.barberMapper = barberMapper;
    }

    @GET
    public List<BarberResponse> findAll(@PathParam("slug") String slug) {
        return barberService.findAllBarbersByBarbershopSlug(slug)
                .stream()
                .map(barberMapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public BarberResponse findById(@PathParam("slug") String slug, @PathParam("id") Long id) {
        return barberMapper.toDto(barberService.findById(slug, id));
    }

    @POST
    public BarberResponse create(@PathParam("slug") String slug, @Valid CreateBarberRequest request) {
        return barberMapper.toDto(barberService.create(slug, barberMapper.toDomain(request)));
    }
}
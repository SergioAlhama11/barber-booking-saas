package com.sergio.api.admin.barbershop;

import com.sergio.api.barbershop.dto.BarbershopResponse;
import com.sergio.api.barbershop.dto.CreateBarbershopRequest;
import com.sergio.api.barbershop.mapper.BarbershopMapper;
import com.sergio.application.barbershop.BarbershopService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/admin/barbershops")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("SUPER_ADMIN")
public class AdminBarbershopResource {

    private final BarbershopService service;
    private final BarbershopMapper mapper;

    public AdminBarbershopResource(
            BarbershopService service,
            BarbershopMapper mapper
    ) {
        this.service = service;
        this.mapper = mapper;
    }

    @GET
    public List<BarbershopResponse> findAll() {
        return service.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @POST
    public BarbershopResponse create(@Valid CreateBarbershopRequest request) {
        return mapper.toDto(service.create(mapper.toDomain(request)));
    }
}

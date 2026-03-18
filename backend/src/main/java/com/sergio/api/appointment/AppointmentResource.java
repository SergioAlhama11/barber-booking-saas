package com.sergio.api.appointment;

import com.sergio.api.appointment.dto.AppointmentResponse;
import com.sergio.api.appointment.dto.CreateAppointmentRequest;
import com.sergio.api.appointment.mapper.AppointmentMapper;
import com.sergio.application.appointment.AppointmentService;
import com.sergio.domain.appointment.Appointment;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.util.List;

@Path("/barbershops/{slug}/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentResource {

    @Inject
    AppointmentService appointmentService;

    @Inject
    AppointmentMapper mapper;

    @GET
    public List<AppointmentResponse> getAll(@PathParam("slug") @NotBlank String slug) {

        return appointmentService.findAllByBarbershop(slug)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public AppointmentResponse getById(
            @PathParam("slug") @NotBlank String slug,
            @PathParam("id") Long id) {

        return mapper.toDto(appointmentService.findById(slug, id));
    }

    @POST
    public Response create(
            @PathParam("slug") @NotBlank String slug,
            @Valid CreateAppointmentRequest request) {

        Appointment created = appointmentService.create(
                slug,
                mapper.toDomain(request)
        );

        URI location = URI.create(String.format(
                "/barbershops/%s/appointments/%d",
                slug,
                created.getId()
        ));

        return Response.created(location)
                .entity(mapper.toDto(created))
                .build();
    }
}

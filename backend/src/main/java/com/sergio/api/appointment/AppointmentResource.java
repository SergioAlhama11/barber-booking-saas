package com.sergio.api.appointment;

import com.sergio.api.appointment.dto.AppointmentResponse;
import com.sergio.api.appointment.dto.CreateAppointmentRequest;
import com.sergio.api.appointment.mapper.AppointmentMapper;
import com.sergio.application.appointment.AppointmentService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.AppointmentFilter;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
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
        return toDtoList(appointmentService.findAllByBarbershop(slug));
    }

    @GET
    @Path("/{id}")
    public AppointmentResponse getById(
            @PathParam("slug") @NotBlank String slug,
            @PathParam("id") Long id) {

        return mapper.toDto(appointmentService.findById(slug, id));
    }

    @GET
    @Path("/by-email")
    public List<AppointmentResponse> getByEmail(
            @PathParam("slug") @NotBlank String slug,
            @QueryParam("email") @NotBlank @Email String email,
            @QueryParam("filter") @DefaultValue("FUTURE") AppointmentFilter filter) {

        return toDtoList(appointmentService.findByEmail(slug, email, filter));
    }

    @POST
    public Response create(
            @PathParam("slug") @NotBlank String slug,
            @Valid CreateAppointmentRequest request) {

        Appointment created = appointmentService.create(slug, mapper.toDomain(request));

        URI location = URI.create(
                String.format("/barbershops/%s/appointments/%d", slug, created.getId())
        );

        return Response.created(location)
                .entity(mapper.toDto(created))
                .build();
    }

    @DELETE
    @Path("/{id}")
    public Response cancel(
            @PathParam("slug") @NotBlank String slug,
            @PathParam("id") Long id,
            @QueryParam("email") @NotBlank @Email String email
    ) {
        appointmentService.cancelAppointmentByEmail(slug, id, email);
        return Response.noContent().build();
    }

    private List<AppointmentResponse> toDtoList(List<Appointment> appointments) {
        return appointments.stream()
                .map(mapper::toDto)
                .toList();
    }
}

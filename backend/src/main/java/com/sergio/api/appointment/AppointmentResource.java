package com.sergio.api.appointment;

import com.sergio.api.appointment.dto.AppointmentResponse;
import com.sergio.api.appointment.dto.CreateAppointmentRequest;
import com.sergio.api.appointment.dto.RescheduleAppointmentRequest;
import com.sergio.api.appointment.mapper.AppointmentMapper;
import com.sergio.application.appointment.AppointmentService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.AppointmentFilter;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

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

    @Context
    UriInfo uriInfo;

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

        return mapper.toDto(appointmentService.findUpcomingById(slug, id));
    }

    @GET
    @Path("/by-email")
    public List<AppointmentResponse> getByEmail(
            @PathParam("slug") @NotBlank String slug,
            @QueryParam("email") @NotBlank @Email String email,
            @QueryParam("filter") @DefaultValue("FUTURE") AppointmentFilter filter,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size) {

        return appointmentService.findByEmail(slug, email, filter, page, size)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @POST
    public Response create(
            @PathParam("slug") @NotBlank String slug,
            @Valid CreateAppointmentRequest request,
            @HeaderParam("X-Forwarded-For") String forwardedFor,
            @Context HttpHeaders headers) {

        String ip = extractClientIp(forwardedFor, headers);

        Appointment created = appointmentService.create(
                slug,
                mapper.toDomain(request),
                ip
        );

        URI location = uriInfo.getAbsolutePathBuilder()
                .path(String.valueOf(created.getId()))
                .build();

        return Response.created(location)
                .entity(mapper.toDto(created))
                .build();
    }

    @POST
    @Path("/{id}/resend-cancel-link")
    public Response resendCancelLink(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @QueryParam("email") String email,
            @HeaderParam("X-Forwarded-For") String forwardedFor,
            @Context jakarta.ws.rs.core.HttpHeaders headers) {

        String ip = extractClientIp(forwardedFor, headers);

        appointmentService.resendCancelLink(slug, id, email, ip);

        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}")
    public AppointmentResponse reschedule(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @Valid RescheduleAppointmentRequest request
    ) {
        Appointment updated = appointmentService.reschedule(slug, id, request.startTime());

        return mapper.toDto(updated);
    }

    @DELETE
    @Path("/cancel")
    public Response cancelByToken(
            @QueryParam("token") @NotBlank String token) {

        appointmentService.cancelByToken(token);
        return Response.noContent().build();
    }

    private String extractClientIp(String forwardedFor, HttpHeaders headers) {

        // 🥇 1. Proxy / producción
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0];
        }

        // 🥈 2. fallback local (dev)
        String realIp = headers.getHeaderString("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }

        // 🥉 3. último fallback (local dev)
        return "127.0.0.1";
    }
}

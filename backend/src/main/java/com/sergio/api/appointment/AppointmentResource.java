package com.sergio.api.appointment;

import com.sergio.api.appointment.dto.AppointmentResponse;
import com.sergio.api.appointment.dto.CreateAppointmentRequest;
import com.sergio.api.appointment.dto.CreateAppointmentResponse;
import com.sergio.api.appointment.dto.RescheduleAppointmentRequest;
import com.sergio.api.appointment.mapper.AppointmentMapper;
import com.sergio.application.appointment.AppointmentService;
import com.sergio.application.auth.AuthService;
import com.sergio.common.util.AuthUtils;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.AppointmentFilter;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
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

    @Inject
    AuthService authService;

    @Context
    UriInfo uriInfo;

    @GET
    public List<AppointmentResponse> getMyAppointments(
            @PathParam("slug") @NotBlank String slug,
            @HeaderParam("Authorization") String authHeader,
            @QueryParam("filter") @DefaultValue("FUTURE") AppointmentFilter filter,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size
    ) {
        String token = AuthUtils.extractToken(authHeader);
        String email = authService.getEmailFromSession(token);

        return appointmentService.findByEmail(slug, email, filter, page, size)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GET
    @Path("/{id}")
    public AppointmentResponse getById(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authHeader,
            @QueryParam("token") String queryToken
    ) {

        // 🔥 1. PRIORIDAD: magic link
        if (queryToken != null) {
            var magic = authService.getMagicSession(queryToken);

            if (magic != null) {
                if (magic.appointmentId() == null || !magic.appointmentId().equals(id)) {
                    throw new ForbiddenException("Invalid access");
                }

                Appointment a = appointmentService.findById(slug, id);

                if (a == null) {
                    throw new NotFoundException("Appointment not found");
                }

                if (!a.getCustomerEmail().equalsIgnoreCase(magic.email())) {
                    throw new ForbiddenException("Invalid access");
                }

                return mapper.toDto(a);
            }
        }

        // 🔐 2. sesión normal
        String email = authService.getEmailFromSession(
                AuthUtils.extractToken(authHeader)
        );

        return mapper.toDto(
                appointmentService.getActiveOwnedAppointment(slug, id, email)
        );
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

        String sessionToken = authService.createSession(created.getCustomerEmail());

        return Response.created(location)
                .entity(new CreateAppointmentResponse(mapper.toDto(created), sessionToken)).build();
    }

    @POST
    @Path("/{id}/resend-cancel-link")
    public Response resendCancelLink(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-Forwarded-For") String forwardedFor,
            @Context HttpHeaders headers
    ) {
        String token = AuthUtils.extractToken(authHeader);
        String email = authService.getEmailFromSession(token);

        String ip = extractClientIp(forwardedFor, headers);

        appointmentService.resendCancelLink(slug, id, email, ip);

        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}")
    public AppointmentResponse reschedule(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authHeader,
            @Valid RescheduleAppointmentRequest request
    ) {
        String email = authService.getEmailFromSession(AuthUtils.extractToken(authHeader));
        return mapper.toDto(appointmentService.reschedule(slug, id, request.startTime(), email));
    }

    @DELETE
    @Path("/{id}")
    public Response cancel(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authHeader
    ) {
        String email = authService.getEmailFromSession(AuthUtils.extractToken(authHeader));
        appointmentService.cancelByUser(slug, id, email);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/cancel")
    public Response cancelByToken(@QueryParam("token") @NotBlank String token) {
        appointmentService.cancelByToken(token);
        return Response.noContent().build();
    }

    private String extractClientIp(String forwardedFor, HttpHeaders headers) {
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0];
        }

        String realIp = headers.getHeaderString("X-Real-IP");

        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }

        return "127.0.0.1";
    }
}

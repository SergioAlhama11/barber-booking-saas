package com.sergio.api.appointment;

import com.sergio.api.appointment.dto.AppointmentResponse;
import com.sergio.api.appointment.dto.CreateAppointmentRequest;
import com.sergio.api.appointment.dto.CreateAppointmentResponse;
import com.sergio.api.appointment.dto.RescheduleAppointmentRequest;
import com.sergio.api.appointment.mapper.AppointmentMapper;
import com.sergio.application.appointment.AppointmentService;
import com.sergio.application.auth.AuthCookieService;
import com.sergio.application.auth.AuthService;
import com.sergio.common.util.AuthUtils;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.AppointmentFilter;
import io.vertx.core.http.HttpServerResponse;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.jboss.logging.Logger;

import java.net.URI;
import java.util.List;

@Path("/barbershops/{slug}/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentResource {

    private static final Logger LOG = Logger.getLogger(AppointmentResource.class);

    @Inject
    AppointmentService appointmentService;

    @Inject
    AppointmentMapper mapper;

    @Inject
    AuthService authService;

    @Inject
    AuthCookieService authCookieService;

    @Context
    UriInfo uriInfo;

    @Context
    HttpServerResponse response;

    @GET
    public List<AppointmentResponse> getMyAppointments(
            @PathParam("slug") @NotBlank String slug,
            @HeaderParam("Authorization") String authHeader,
            @CookieParam(AuthCookieService.SESSION_COOKIE_NAME) String sessionCookie,
            @QueryParam("filter") @DefaultValue("FUTURE") AppointmentFilter filter,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size
    ) {
        String token = AuthUtils.extractToken(authHeader, sessionCookie);
        String email = authService.getEmailFromSession(token);

        LOG.infof(
                "appointments_fetch_requested slug=%s email=%s filter=%s page=%d size=%d",
                slug,
                email,
                filter,
                page,
                size
        );

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
            @CookieParam(AuthCookieService.SESSION_COOKIE_NAME) String sessionCookie,
            @QueryParam("token") String queryToken
    ) {

        // 🔥 1. PRIORIDAD: magic link
        if (queryToken != null) {
            LOG.infof(
                    "appointment_magic_access_requested slug=%s appointmentId=%d",
                    slug,
                    id
            );

            var magic = authService.getMagicSession(queryToken);

            if (magic != null) {
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
        String email = authService.getEmailFromSession(AuthUtils.extractToken(authHeader, sessionCookie));

        LOG.infof(
                "appointment_access_requested slug=%s appointmentId=%d email=%s auth=session",
                slug,
                id,
                email
        );

        return mapper.toDto(appointmentService.getActiveOwnedAppointment(slug, id, email));
    }

    @POST
    public Response create(
            @PathParam("slug") @NotBlank String slug,
            @Valid CreateAppointmentRequest request,
            @HeaderParam("X-Forwarded-For") String forwardedFor,
            @Context HttpHeaders headers) {

        String ip = extractClientIp(forwardedFor, headers);

        LOG.infof(
                "appointment_create_requested slug=%s barberId=%d serviceId=%d email=%s ip=%s",
                slug,
                request.barberId(),
                request.serviceId(),
                request.customerEmail(),
                ip);

        Appointment created = appointmentService.create(
                slug,
                mapper.toDomain(request),
                ip
        );

        URI location = uriInfo.getAbsolutePathBuilder()
                .path(String.valueOf(created.getId()))
                .build();

        String sessionToken = authService.createSession(created.getCustomerEmail());
        authCookieService.writeSessionCookie(response, sessionToken, authService.getSessionTtlSeconds());

        return Response.created(location)
                .entity(new CreateAppointmentResponse(mapper.toDto(created))).build();
    }

    @POST
    @Path("/{id}/resend-cancel-link")
    public Response resendCancelLink(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authHeader,
            @CookieParam(AuthCookieService.SESSION_COOKIE_NAME) String sessionCookie,
            @HeaderParam("X-Forwarded-For") String forwardedFor,
            @Context HttpHeaders headers
    ) {
        String token = AuthUtils.extractToken(authHeader, sessionCookie);
        String email = authService.getEmailFromSession(token);

        String ip = extractClientIp(forwardedFor, headers);

        LOG.infof(
                "appointment_resend_requested slug=%s appointmentId=%d email=%s ip=%s",
                slug,
                id,
                email,
                ip
        );

        appointmentService.resendCancelLink(slug, id, email, ip);

        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}")
    public AppointmentResponse reschedule(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authHeader,
            @CookieParam(AuthCookieService.SESSION_COOKIE_NAME) String sessionCookie,
            @Valid RescheduleAppointmentRequest request
    ) {
        String email = authService.getEmailFromSession(AuthUtils.extractToken(authHeader, sessionCookie));

        LOG.infof(
                "appointment_reschedule_requested slug=%s appointmentId=%d email=%s",
                slug,
                id,
                email
        );

        return mapper.toDto(appointmentService.reschedule(slug, id, request.startTime(), email));
    }

    @DELETE
    @Path("/{id}")
    public Response cancel(
            @PathParam("slug") String slug,
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authHeader,
            @CookieParam(AuthCookieService.SESSION_COOKIE_NAME) String sessionCookie
    ) {
        String email = authService.getEmailFromSession(AuthUtils.extractToken(authHeader, sessionCookie));

        LOG.infof(
                "appointment_cancel_requested slug=%s appointmentId=%d email=%s",
                slug,
                id,
                email
        );

        appointmentService.cancelByUser(slug, id, email);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/cancel")
    public Response cancelByToken(@QueryParam("token") @NotBlank String token) {
        LOG.info("appointment_cancel_by_token_requested");
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

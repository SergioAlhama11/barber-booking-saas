package com.sergio.api.admin.auth;

import com.sergio.api.admin.auth.dto.AdminLoginRequest;
import com.sergio.api.admin.auth.mapper.AdminAuthMapper;
import com.sergio.application.admin.auth.AdminAuthService;
import com.sergio.infrastructure.security.AdminAuthCookieService;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.Duration;

@Path("/admin/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminAuthResource {

    private final AdminAuthService adminAuthService;
    private final AdminAuthMapper mapper;
    private final AdminAuthCookieService cookieService;

    public AdminAuthResource(
            AdminAuthService adminAuthService,
            AdminAuthMapper mapper,
            AdminAuthCookieService cookieService
    ) {
        this.adminAuthService = adminAuthService;
        this.mapper = mapper;
        this.cookieService = cookieService;
    }

    @POST
    @Path("/login")
    public Response login(@Valid AdminLoginRequest request) {

        String token = adminAuthService.login(mapper.toDomain(request));

        return Response.ok()
                .cookie(cookieService.buildSessionCookie(token, (int) Duration.ofDays(7).getSeconds()))
                .build();
    }

    @POST
    @Path("/logout")
    public Response logout() {
        return Response.ok()
                .cookie(cookieService.buildExpiredCookie())
                .build();
    }
}
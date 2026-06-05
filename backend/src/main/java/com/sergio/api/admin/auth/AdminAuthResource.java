package com.sergio.api.admin.auth;

import com.sergio.api.admin.auth.dto.AdminLoginRequest;
import com.sergio.api.admin.auth.dto.AdminLoginResponse;
import com.sergio.api.admin.auth.mapper.AdminAuthMapper;
import com.sergio.application.admin.auth.AdminAuthService;
import com.sergio.domain.admin.AdminUser;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/admin/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminAuthResource {

    private final AdminAuthService adminAuthService;
    private final AdminAuthMapper mapper;

    public AdminAuthResource(AdminAuthService adminAuthService, AdminAuthMapper mapper) {
        this.adminAuthService = adminAuthService;
        this.mapper = mapper;
    }

    @POST
    @Path("/login")
    public AdminLoginResponse login(@Valid AdminLoginRequest request) {
        AdminUser loginRequest = mapper.toDomain(request);
        String token = adminAuthService.login(loginRequest);

        return mapper.toDto(token);
    }
}
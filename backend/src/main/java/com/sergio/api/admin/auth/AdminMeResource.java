package com.sergio.api.admin.auth;

import com.sergio.api.admin.auth.dto.AdminMeResponse;
import com.sergio.api.admin.auth.mapper.AdminMeMapper;
import com.sergio.application.admin.auth.AuthenticatedAdmin;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/admin/me")
@Produces(MediaType.APPLICATION_JSON)
public class AdminMeResource {

    private final AuthenticatedAdmin admin;
    private final AdminMeMapper mapper;

    public AdminMeResource(AuthenticatedAdmin admin, AdminMeMapper mapper) {
        this.admin = admin;
        this.mapper = mapper;
    }

    @GET
    @RolesAllowed({"SUPER_ADMIN", "OWNER", "BARBER"})
    public AdminMeResponse me(){
        return mapper.toDto(admin);
    }
}
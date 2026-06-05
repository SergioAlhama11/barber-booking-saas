package com.sergio.api.admin.user;

import com.sergio.api.admin.user.dto.AdminUserResponse;
import com.sergio.api.admin.user.dto.CreateAdminUserRequest;
import com.sergio.api.admin.user.mapper.AdminUserMapper;
import com.sergio.application.admin.user.AdminUserService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/admin/users")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("SUPER_ADMIN")
public class AdminUserResource {

    private final AdminUserService adminUserService;
    private final AdminUserMapper mapper;

    public AdminUserResource(
            AdminUserService adminUserService,
            AdminUserMapper mapper
    ) {
        this.adminUserService = adminUserService;
        this.mapper = mapper;
    }

    @GET
    public List<AdminUserResponse> findAll() {
        return adminUserService.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @POST
    public AdminUserResponse create(@Valid CreateAdminUserRequest request) {
        return mapper.toDto(adminUserService.create(mapper.toDomain(request)));
    }
}
package com.sergio.api.admin.user.dto;

import com.sergio.domain.admin.AdminRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAdminUserRequest(

        @Email
        @NotBlank
        String email,

        @NotBlank
        String password,

        @NotNull
        AdminRole role,

        Long barbershopId,
        Long barberId
) {}
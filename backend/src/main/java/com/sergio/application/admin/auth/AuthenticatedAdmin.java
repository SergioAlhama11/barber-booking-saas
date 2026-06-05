package com.sergio.application.admin.auth;

import java.util.Set;

public record AuthenticatedAdmin(
        Long id,
        String email,
        Long barbershopId,
        Long barberId,
        Set<String> roles
) {}
package com.sergio.api.admin.auth.dto;

import java.util.Set;

public record AdminMeResponse(
        Long id,
        String email,
        Long barbershopId,
        Long barberId,
        Set<String> roles
) {}
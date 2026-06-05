package com.sergio.api.admin.user.dto;

public record AdminUserResponse(
        Long id,
        String email,
        String role,
        Long barbershopId,
        Long barberId) {}

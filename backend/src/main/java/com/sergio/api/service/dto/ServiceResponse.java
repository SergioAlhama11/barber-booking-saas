package com.sergio.api.service.dto;

public record ServiceResponse(
        Long id,
        String name,
        Integer durationMinutes
) {}
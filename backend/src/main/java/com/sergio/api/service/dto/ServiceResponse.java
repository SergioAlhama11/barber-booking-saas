package com.sergio.api.service.dto;

import java.math.BigDecimal;

public record ServiceResponse(
        Long id,
        String name,
        Integer durationMinutes,
        BigDecimal price
) {}
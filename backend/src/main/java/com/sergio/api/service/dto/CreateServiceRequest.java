package com.sergio.api.service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateServiceRequest(
        @NotBlank String name,
        @NotNull Integer durationMinutes,
        @NotNull @DecimalMin("0.01") BigDecimal price
) {}
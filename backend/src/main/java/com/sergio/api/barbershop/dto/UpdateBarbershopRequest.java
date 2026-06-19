package com.sergio.api.barbershop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBarbershopRequest(
        @NotBlank
        @Size(min = 2, max = 50)
        String name
) {}

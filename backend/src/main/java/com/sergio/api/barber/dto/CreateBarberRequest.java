package com.sergio.api.barber.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateBarberRequest(@NotBlank String name) {}

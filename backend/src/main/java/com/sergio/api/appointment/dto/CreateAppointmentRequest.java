package com.sergio.api.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateAppointmentRequest(
        @NotNull Long barberId,
        @NotNull Long serviceId,
        @NotBlank String customerName,
        @NotNull LocalDateTime startTime
) {}

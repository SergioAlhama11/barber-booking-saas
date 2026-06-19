package com.sergio.api.admin.appointment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record AdminUpdateAppointmentRequest(

        @NotNull
        Long barberId,

        @NotNull
        Long serviceId,

        @NotBlank
        String customerName,

        @NotBlank
        @Email
        String customerEmail,

        @NotNull
        Instant startTime
) {}

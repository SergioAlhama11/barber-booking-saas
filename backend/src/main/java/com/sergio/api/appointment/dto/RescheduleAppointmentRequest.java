package com.sergio.api.appointment.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record RescheduleAppointmentRequest(@NotNull Instant startTime) {}

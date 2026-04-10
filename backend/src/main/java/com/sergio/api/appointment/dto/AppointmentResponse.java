package com.sergio.api.appointment.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        Long barberId,
        Long serviceId,
        String barberName,
        String serviceName,
        String customerName,
        String customerEmail,
        Instant startTime,
        Instant endTime,
        Instant cancelledAt
) {}

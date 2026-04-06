package com.sergio.infrastructure.persistence.appointment;

import java.time.Instant;
import java.time.LocalDateTime;

public record AppointmentProjection(
        Long id,
        Long barbershopId,
        Long barberId,
        Long serviceId,
        String barberName,
        String serviceName,
        String customerName,
        String customerEmail,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Instant cancelledAt,
        String source
) {}

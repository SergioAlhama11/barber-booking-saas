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
        Instant startTime,
        Instant endTime,
        Instant cancelledAt,
        String source,
        int calendarVersion
) {}

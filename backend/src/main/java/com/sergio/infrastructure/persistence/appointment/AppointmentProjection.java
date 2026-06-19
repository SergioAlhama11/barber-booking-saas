package com.sergio.infrastructure.persistence.appointment;

import com.sergio.domain.appointment.AppointmentSource;

import java.time.Instant;
import java.time.LocalDateTime;

public record AppointmentProjection(
        Long id,
        Long barbershopId,
        Long barberId,
        Long serviceId,
        String barbershopName,
        String barberName,
        String serviceName,
        String customerName,
        String customerEmail,
        Instant startTime,
        Instant endTime,
        Instant cancelledAt,
        AppointmentSource source,
        int calendarVersion
) {}

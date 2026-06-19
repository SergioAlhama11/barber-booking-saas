package com.sergio.api.admin.appointment.dto;

import java.time.Instant;

import com.sergio.domain.appointment.AppointmentSource;

public record AdminAppointmentResponse(
        Long id,
        Long barbershopId,
        Long barberId,
        Long serviceId,
        AppointmentSource source,
        String barbershopName,
        String barberName,
        String serviceName,
        String customerName,
        String customerEmail,
        Instant startTime,
        Instant endTime,
        Instant cancelledAt
) {}
package com.sergio.api.admin.appointment.dto;

import java.time.Instant;

public record AdminAppointmentResponse(
        Long id,
        String customerName,
        String customerEmail,
        String barberName,
        String serviceName,
        Instant startTime,
        Instant endTime,
        Instant cancelledAt
) {}
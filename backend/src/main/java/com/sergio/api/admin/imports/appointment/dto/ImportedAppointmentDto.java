package com.sergio.api.admin.imports.appointment.dto;

import java.time.Instant;

public record ImportedAppointmentDto(
        String customerName,
        String customerEmail,
        //String barberName,
        //String serviceName,
        Instant startTime,
        boolean valid,
        String warning
) {}
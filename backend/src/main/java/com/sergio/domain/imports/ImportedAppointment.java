package com.sergio.domain.imports;

import java.time.Instant;

public record ImportedAppointment(
        String customerName,
        String customerEmail,

        //String barberName,
        //String serviceName,

        Instant startTime,

        boolean valid,
        String warning
) {}
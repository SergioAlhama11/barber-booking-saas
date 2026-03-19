package com.sergio.api.appointment.dto;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        Long barberId,
        Long serviceId,
        // String serviceName,
        String customerName,
        String customerEmail,
        LocalDateTime startTime,
        LocalDateTime endTime
) {}

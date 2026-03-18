package com.sergio.api.appointment.dto;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        Long barberId,
        String customerName,
        LocalDateTime startTime,
        LocalDateTime endTime
) {}

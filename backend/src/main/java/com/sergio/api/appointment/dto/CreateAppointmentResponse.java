package com.sergio.api.appointment.dto;

public record CreateAppointmentResponse(
        AppointmentResponse appointment,
        String token
) {}

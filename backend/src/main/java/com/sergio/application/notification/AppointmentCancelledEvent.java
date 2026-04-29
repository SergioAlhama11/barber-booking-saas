package com.sergio.application.notification;

import com.sergio.domain.appointment.Appointment;

public record AppointmentCancelledEvent(
        Appointment appointment,
        String slug
) {}

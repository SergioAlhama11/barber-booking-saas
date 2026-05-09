package com.sergio.application.notification;

import com.sergio.domain.appointment.Appointment;

public record AppointmentRescheduledEvent(
        Appointment appointment,
        String slug
) {}

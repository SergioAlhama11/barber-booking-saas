package com.sergio.application.notification;

import com.sergio.application.notification.template.AppointmentActionSource;
import com.sergio.domain.appointment.Appointment;

public record AppointmentRescheduledEvent(
        Appointment appointment,
        String slug,
        AppointmentActionSource source
) {}

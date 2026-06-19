package com.sergio.application.notification;

import com.sergio.application.notification.template.AppointmentActionSource;
import com.sergio.domain.appointment.Appointment;

public record AppointmentCreatedEvent(
        Appointment appointment,
        String cancelToken,
        String slug,
        AppointmentActionSource source
) {}
package com.sergio.application.notification;

public record AppointmentCreatedEvent(
        String email,
        String name,
        String cancelToken
) {
}

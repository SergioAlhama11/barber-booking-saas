package com.sergio.application.notification.template;

public final class AppointmentEmailFactory {

    private AppointmentEmailFactory() {}

    public static EmailContent confirmationContent(AppointmentActionSource source) {

        return switch (source) {

            case CUSTOMER -> new EmailContent(
                    "Confirmación de cita - Barbería",
                    "Confirmación de cita",
                    "Tu cita ha sido confirmada correctamente."
            );

            case ADMIN -> new EmailContent(
                    "Nueva cita registrada",
                    "La barbería ha creado una cita para ti",
                    "La barbería ha registrado una cita en tu nombre."
            );
        };
    }

    public static EmailContent rescheduledContent(AppointmentActionSource source) {

        return switch (source) {

            case CUSTOMER -> new EmailContent(
                    "Modificación de cita - Barbería",
                    "Tu cita ha sido modificada",
                    "Tu cita ha sido actualizada correctamente."
            );

            case ADMIN -> new EmailContent(
                    "La barbería ha modificado tu cita",
                    "Tu cita ha sido modificada por la barbería",
                    "La barbería ha realizado cambios en tu reserva."
            );
        };
    }

    public static EmailContent cancelledContent(AppointmentActionSource source) {

        return switch (source) {

            case CUSTOMER -> new EmailContent(
                    "Cancelación de cita - Barbería",
                    "Tu cita ha sido cancelada",
                    "Tu cita ha sido cancelada correctamente."
            );

            case ADMIN -> new EmailContent(
                    "La barbería ha cancelado tu cita",
                    "Tu cita ha sido cancelada por la barbería",
                    "La barbería ha cancelado tu reserva."
            );
        };
    }
}
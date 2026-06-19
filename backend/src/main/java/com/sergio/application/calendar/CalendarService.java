package com.sergio.application.calendar;

import com.sergio.domain.appointment.Appointment;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@ApplicationScoped
public class CalendarService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");
    private static final DateTimeFormatter LOCAL_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
    private static final DateTimeFormatter UTC_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter DESCRIPTION_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZONE);

    public String generateIcs(Appointment a) {

        String uid = buildUid(a);
        String now = utcNow();

        String start = formatLocal(a.getStartTime());
        String end = formatLocal(a.getEndTime());

        String description = escape(
                        "Servicio: " + a.getServiceName() + "\n" +
                        "Barbero: " + a.getBarberName() + "\n" +
                        "Fecha: " + formatForDescription(a.getStartTime()) + "\n\n" +
                        "Reserva gestionada mediante Trimly."
        );

        return """
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Trimly//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:%s
SEQUENCE:%d
STATUS:CONFIRMED
DTSTAMP:%s
LAST-MODIFIED:%s
DTSTART;TZID=Europe/Madrid:%s
DTEND;TZID=Europe/Madrid:%s
SUMMARY:Cita - %s
DESCRIPTION:%s
LOCATION:%s
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:%s
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Recordatorio de cita
END:VALARM
END:VEVENT
END:VCALENDAR
""".formatted(
                uid,
                a.getCalendarVersion(),
                now,
                now,
                start,
                end,
                a.getServiceName(),
                description,
                a.getBarbershopName(),
                a.getCustomerEmail()
        );
    }

    public String generateCancelledIcs(Appointment a) {
        String uid = buildUid(a);
        String now = utcNow();
        String start = formatLocal(a.getStartTime());
        String end = formatLocal(a.getEndTime());

        return """
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Trimly//EN
CALSCALE:GREGORIAN
METHOD:CANCEL

BEGIN:VEVENT
UID:%s
SEQUENCE:%d

STATUS:CANCELLED

TRANSP:TRANSPARENT

DTSTAMP:%s
LAST-MODIFIED:%s

DTSTART;TZID=Europe/Madrid:%s
DTEND;TZID=Europe/Madrid:%s

SUMMARY:Cita cancelada - %s

ATTENDEE:mailto:%s

END:VEVENT
END:VCALENDAR
""".formatted(
                uid,
                a.getCalendarVersion(),
                now,
                now,
                start,
                end,
                a.getServiceName(),
                a.getCustomerEmail()
        );
    }

    // =========================
    // HELPERS
    // =========================

    private String buildUid(Appointment a) {
        return "appointment-" + a.getId() + "@trimly.app";
    }

    private String formatLocal(Instant instant) {
        return instant.atZone(ZONE).format(LOCAL_FORMAT);
    }

    private String formatForDescription(Instant instant) {
        return DESCRIPTION_FORMAT.format(instant);
    }

    private String utcNow() {
        return UTC_FORMAT.format(Instant.now());
    }

    private String escape(String text) {
        return text
                .replace("\\", "\\\\")
                .replace("\n", "\\n")
                .replace(",", "\\,")
                .replace(";", "\\;");
    }
}
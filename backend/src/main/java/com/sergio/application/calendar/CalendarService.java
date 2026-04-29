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

    public String generateIcs(Appointment a) {

        String uid = buildUid(a);
        String now = utcNow();

        String start = formatLocal(a.getStartTime());
        String end = formatLocal(a.getEndTime());

        String description = escape(
                "Cita en barbería\n" +
                        "Servicio: " + a.getServiceName() + "\n" +
                        "Barbero: " + a.getBarberName()
        );

        return """
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BarberApp//EN
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
SUMMARY:%s - %s
DESCRIPTION:%s
LOCATION:Barbería
ORGANIZER:mailto:no-reply@barberapp.com
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
                a.getCustomerName(),
                description,
                a.getCustomerEmail()
        );
    }

    public String generateCancelledIcs(Appointment a) {
        String uid = buildUid(a);
        String now = utcNow();

        String start = formatLocal(a.getStartTime());

        return """
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BarberApp//EN
METHOD:CANCEL
BEGIN:VEVENT
UID:%s
SEQUENCE:%d
STATUS:CANCELLED
DTSTAMP:%s
DTSTART;TZID=Europe/Madrid:%s
SUMMARY:Cita cancelada
END:VEVENT
END:VCALENDAR
""".formatted(
                uid,
                a.getCalendarVersion(),
                now,
                start
        );
    }

    // =========================
    // HELPERS
    // =========================

    private String buildUid(Appointment a) {
        return "appointment-" + a.getId() + "@barberapp";
    }

    private String formatLocal(Instant instant) {
        return instant.atZone(ZONE).format(LOCAL_FORMAT);
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
package com.sergio.application.calendar;

import com.sergio.domain.appointment.Appointment;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@ApplicationScoped
public class CalendarService {

    private static final DateTimeFormatter ICS_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);

    public String generateIcs(Appointment a) {

        String uid = "appointment-" + a.getId() + "@barberapp";

        String start = formatUtc(a.getStartTime());
        String end = formatUtc(a.getEndTime());

        String now = now();

        String description = escape(
                "Cita en barbería\n" +
                        "Servicio: " + a.getServiceName() + "\n" +
                        "Barbero: " + a.getBarberName()
        );

        System.out.println("ICS START: " + a.getStartTime());
        System.out.println("ICS VERSION: " + a.getCalendarVersion());

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
DTSTART:%s
DTEND:%s
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
                a.getCalendarVersion(), // 🔥 clave para updates
                now,
                formatUtc(a.getStartTime()),
                start,
                end,
                a.getServiceName(),
                a.getCustomerName(),
                description,
                a.getCustomerEmail()
        );
    }

    private String formatUtc(Instant instant) {
        return ICS_FORMAT.format(instant);
    }

    private String escape(String text) {
        return text
                .replace("\\", "\\\\")
                .replace("\n", "\\n")
                .replace(",", "\\,")
                .replace(";", "\\;");
    }

    private String now() {
        return ICS_FORMAT.format(Instant.now());
    }
}
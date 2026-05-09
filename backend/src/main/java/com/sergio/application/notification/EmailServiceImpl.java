package com.sergio.application.notification;

import com.sergio.application.calendar.CalendarService;
import com.sergio.application.notification.template.EmailTemplateLoader;
import com.sergio.domain.appointment.Appointment;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@ApplicationScoped
public class EmailServiceImpl implements EmailService {

    private static final Logger LOG = Logger.getLogger(EmailServiceImpl.class);
    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy - HH:mm").withZone(ZONE);

    private static final String CONFIRMATION_EMAIL_SUBJECT = "Confirmación de cita - Barbería";
    private static final String RESCHEDULED_EMAIL_SUBJECT = "Modificación de cita - Barbería";
    private static final String CANCELLED_EMAIL_SUBJECT = "Cancelación de cita - Barbería";
    private static final String OTP_EMAIL_SUBJECT = "Código de acceso";

    @Inject BrevoEmailService brevo;

    @Inject
    CalendarService calendarService;

    @ConfigProperty(name = "app.env", defaultValue = "dev")
    String env;

    // =========================
    // PUBLIC API
    // =========================

    @Override
    public void sendAppointmentConfirmation(
            Appointment a,
            String manageUrl,
            String cancelUrl,
            String loginUrl
    ) {

        String ics = calendarService.generateIcs(a);

        send(
                a.getCustomerEmail(),
                CONFIRMATION_EMAIL_SUBJECT,
                "confirmation.html",
                Map.of(
                        "name", a.getCustomerName(),
                        "service", a.getServiceName(),
                        "barber", a.getBarberName(),
                        "date", format(a.getStartTime()),
                        "manageUrl", manageUrl,
                        "cancelUrl", cancelUrl,
                        "loginUrl", loginUrl
                ),
                ics
        );
    }

    @Override
    public void sendAppointmentRescheduled(
            Appointment a,
            String manageUrl
    ) {

        String ics = calendarService.generateIcs(a);

        send(
                a.getCustomerEmail(),
                RESCHEDULED_EMAIL_SUBJECT,
                "rescheduled.html",
                Map.of(
                        "name", a.getCustomerName(),
                        "service", a.getServiceName(),
                        "barber", a.getBarberName(),
                        "date", format(a.getStartTime()),
                        "manageUrl", manageUrl
                ),
                ics
        );
    }

    @Override
    public void sendAppointmentCancelled(Appointment appointment, String bookingUrl) {
        String ics = calendarService.generateCancelledIcs(appointment);

        send(
                appointment.getCustomerEmail(),
                CANCELLED_EMAIL_SUBJECT,
                "cancelled.html",
                Map.of(
                        "name", appointment.getCustomerName(),
                        "service", appointment.getServiceName(),
                        "barber", appointment.getBarberName(),
                        "date", format(appointment.getStartTime()),
                        "bookingUrl", bookingUrl
                ),
                ics
        );
    }

    @Override
    public void sendOtp(String to, String code, String magicUrl) {
        send(
                to,
                OTP_EMAIL_SUBJECT,
                "otp.html",
                Map.of(
                        "code", code,
                        "magicUrl", magicUrl
                ),
                null
        );
    }

    // =========================
    // CORE
    // =========================

    private void send(String to, String subject, String templateName, Map<String, String> values, String icsContent) {
        try {
            String html = render(EmailTemplateLoader.load(templateName), values);
            sendEmail(to, subject, html, icsContent);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send email [%s] to %s", templateName, to);
        }
    }

    private String format(Instant date) {
        return FORMATTER.format(date);
    }

    private void sendEmail(String to, String subject, String html, String ics) {
        if (isDev()) {
            logDevEmail(to, html, subject);
            return;
        }

        if (ics != null) {
            brevo.sendWithAttachment(
                    to,
                    subject,
                    html,
                    "appointment.ics",
                    ics
            );
        } else {
            brevo.send(to, subject, html);
        }

        LOG.infof("Email sent to %s", to);
    }

    private boolean isDev() {
        return "dev".equalsIgnoreCase(env);
    }

    private void logDevEmail(String to, String html, String subject) {
        LOG.infof("""
                
                ================= EMAIL DEV =================
                TO: %s
                SUBJECT: %s
                -------------------------------------------
                %s
                ===========================================
                
                """, to, subject, html);
    }

    private String render(String template, Map<String, String> values) {
        String result = template;
        for (var entry : values.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }
}
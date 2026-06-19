package com.sergio.application.notification;

import com.sergio.application.calendar.CalendarService;
import com.sergio.application.notification.template.AppointmentActionSource;
import com.sergio.application.notification.template.AppointmentEmailFactory;
import com.sergio.application.notification.template.EmailContent;
import com.sergio.application.notification.template.EmailTemplateLoader;
import com.sergio.domain.appointment.Appointment;
import com.sergio.infrastructure.config.AppConfig;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@ApplicationScoped
public class EmailServiceImpl implements EmailService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy - HH:mm").withZone(ZONE);

    private static final String OTP_EMAIL_SUBJECT = "Código de acceso";

    private static final Logger LOG = Logger.getLogger(EmailServiceImpl.class);

    private Counter emailsSentCounter;
    private Counter emailFailuresCounter;
    private Counter otpEmailsCounter;

    @Inject BrevoEmailService brevo;

    @Inject
    CalendarService calendarService;

    @Inject
    AppConfig appConfig;

    @Inject
    MeterRegistry meterRegistry;

    @PostConstruct
    void initMetrics() {
        emailsSentCounter = meterRegistry.counter("emails_sent");
        emailFailuresCounter = meterRegistry.counter("email_failures");
        otpEmailsCounter = meterRegistry.counter("otp_emails_sent");
    }

    // =========================
    // PUBLIC API
    // =========================

    @Override
    public void sendAppointmentConfirmation(Appointment a, String manageUrl, String cancelUrl, AppointmentActionSource source) {

        EmailContent content = AppointmentEmailFactory.confirmationContent(source);

        String ics = calendarService.generateIcs(a);

        send(
                a.getCustomerEmail(),
                content.subject(),
                "confirmation.html",
                Map.of(
                        "title", content.title(),
                        "message", content.message(),
                        "name", a.getCustomerName(),
                        "service", a.getServiceName(),
                        "barber", a.getBarberName(),
                        "date", format(a.getStartTime()),
                        "manageUrl", manageUrl,
                        "cancelUrl", cancelUrl
                ),
                ics
        );
    }

    @Override
    public void sendAppointmentRescheduled(Appointment a, String manageUrl, AppointmentActionSource source) {

        EmailContent content = AppointmentEmailFactory.rescheduledContent(source);
        String ics = calendarService.generateIcs(a);

        send(
                a.getCustomerEmail(),
                content.subject(),
                "rescheduled.html",
                Map.of(
                        "title", content.title(),
                        "message", content.message(),
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
    public void sendAppointmentCancelled(Appointment appointment, String bookingUrl, AppointmentActionSource source) {

        EmailContent content = AppointmentEmailFactory.cancelledContent(source);
        String ics = calendarService.generateCancelledIcs(appointment);

        send(
                appointment.getCustomerEmail(),
                content.subject(),
                "cancelled.html",
                Map.of(
                        "title", content.title(),
                        "message", content.message(),
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
        otpEmailsCounter.increment();
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
            emailFailuresCounter.increment();
            LOG.errorf(e, "Failed to send email [%s] to %s", templateName, to);
        }
    }

    private String format(Instant date) {
        return FORMATTER.format(date);
    }

    private void sendEmail(String to, String subject, String html, String ics) {
        if (!appConfig.isEmailEnabled()) {
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

        LOG.infof(
                "email_sent type=%s to=%s",
                subject,
                to
        );

        emailsSentCounter.increment();
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
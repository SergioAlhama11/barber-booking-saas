package com.sergio.application.notification;

import com.sergio.application.auth.AuthService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.infrastructure.config.AppConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AppointmentEmailListener {

    private static final Logger LOG = Logger.getLogger(AppointmentEmailListener.class);

    @Inject AppConfig appConfig;
    @Inject EmailService emailService;
    @Inject AuthService authService;

    // =========================
    // EVENTS
    // =========================

    public void onAppointmentCreated(@Observes(during = TransactionPhase.AFTER_SUCCESS) AppointmentCreatedEvent event) {
        Appointment a = event.appointment();

        try {
            emailService.sendAppointmentConfirmation(
                    a,
                    buildManageUrl(event.slug(), a.getId(), a.getCustomerEmail()),
                    buildCancelUrl(event.slug(), event.cancelToken()),
                    buildLoginUrl(event.slug())
            );

        } catch (Exception e) {
            LOG.errorf(e, "Failed to send confirmation email to %s", a.getCustomerEmail());
        }
    }

    public void onAppointmentRescheduled(@Observes(during = TransactionPhase.AFTER_SUCCESS) AppointmentRescheduledEvent event) {
        Appointment a = event.appointment();

        try {
            emailService.sendAppointmentRescheduled(
                    a,
                    buildManageUrl(event.slug(), a.getId(), a.getCustomerEmail())
            );

        } catch (Exception e) {
            LOG.errorf(e, "Failed to send rescheduled email to %s", a.getCustomerEmail());
        }
    }

    public void onAppointmentCancelled(@Observes(during = TransactionPhase.AFTER_SUCCESS) AppointmentCancelledEvent event) {
        Appointment a = event.appointment();

        try {
            emailService.sendAppointmentCancelled(
                    a,
                    buildBookingUrl(event.slug())
            );

        } catch (Exception e) {
            LOG.errorf(e, "Failed to send cancelled email to %s", a.getCustomerEmail());
        }
    }

    // =========================
    // URL BUILDERS (DRY)
    // =========================

    private String buildManageUrl(String slug, Long appointmentId, String email) {
        String token = authService.createMagicSession(email, appointmentId);
        return baseUrl(slug)
                + "/my-bookings/" + appointmentId
                + "?token=" + token;
    }

    private String buildCancelUrl(String slug, String cancelToken) {
        return baseUrl(slug)
                + "/cancel?token=" + cancelToken;
    }

    private String buildLoginUrl(String slug) {
        return baseUrl(slug) + "/my-bookings";
    }

    private String buildBookingUrl(String slug) {
        return baseUrl(slug);
    }

    private String baseUrl(String slug) {
        return appConfig.getFrontendUrl() + "/barbershops/" + slug;
    }
}
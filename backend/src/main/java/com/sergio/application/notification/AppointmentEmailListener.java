package com.sergio.application.notification;

import com.sergio.infrastructure.config.AppConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AppointmentEmailListener {

    private static final Logger LOG = Logger.getLogger(AppointmentEmailListener.class);

    @Inject
    AppConfig appConfig;

    @Inject
    EmailService emailService;

    public void onAppointmentCreated(@Observes(during = TransactionPhase.AFTER_SUCCESS)
                                     AppointmentCreatedEvent event) {
        try {
            String cancelUrl = appConfig.getFrontendUrl()
                    + "/barbershops/"
                    + event.slug()
                    + "/cancel?token="
                    + event.cancelToken();

            emailService.sendAppointmentConfirmation(
                    event.email(),
                    event.name(),
                    cancelUrl
            );

        } catch (Exception e) {
            LOG.error("Failed to send confirmation email", e);
        }
    }
}

package com.sergio.application.notification;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class EmailServiceImpl implements EmailService {

    private static final Logger LOG = Logger.getLogger(EmailServiceImpl.class);

    @Inject
    Mailer mailer;

    @Override
    public void sendAppointmentConfirmation(
            String to,
            String customerName,
            String cancelUrl
    ) {
        try {
            mailer.send(
                    Mail.withHtml(
                            to,
                            buildSubject(),
                            buildBody(customerName, cancelUrl)
                    )
            );

            LOG.infof("Appointment confirmation email sent to %s", to);

        } catch (Exception e) {
            LOG.errorf(e, "Failed to send email to %s", to);
        }
    }

    private String buildSubject() {
        return "Confirmación de cita 💈";
    }

    private String buildBody(String name, String cancelUrl) {
        return """
        <html>
        <body style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
            <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:10px;">
                
                <h2 style="color:#333;">💈 Confirmación de cita</h2>
                
                <p>Hola <strong>%s</strong>,</p>
                
                <p>Tu cita ha sido confirmada correctamente.</p>
                
                <p>Si necesitas cancelarla, puedes hacerlo desde aquí:</p>
                
                <div style="text-align:center; margin:30px 0;">
                    <a href="%s"
                       style="background:#e63946; color:white; padding:12px 20px;
                              text-decoration:none; border-radius:5px; font-weight:bold;">
                        Cancelar cita
                    </a>
                </div>
                
                <p style="font-size:12px; color:#888;">
                    Si no solicitaste esta cita, puedes ignorar este mensaje.
                </p>
                
            </div>
        </body>
        </html>
        """.formatted(name, cancelUrl);
    }
}

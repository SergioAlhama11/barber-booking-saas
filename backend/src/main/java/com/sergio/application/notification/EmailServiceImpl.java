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
        // 🔥 sin problemas de encoding en MailHog
        return "Confirmación de cita - Barbería";
    }

    private String buildBody(String name, String cancelUrl) {
        return """
        <html>
        <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, sans-serif;">
            
            <div style="max-width:520px; margin:40px auto; background:#ffffff; border-radius:10px; padding:24px;">
                
                <!-- HEADER -->
                <h2 style="margin-top:0; color:#222;">
                    💈 Confirmación de cita
                </h2>
                
                <!-- CONTENT -->
                <p style="color:#333;">Hola <strong>%s</strong>,</p>
                
                <p style="color:#333;">
                    Tu cita ha sido confirmada correctamente.
                </p>
                
                <p style="color:#333;">
                    Si necesitas cancelarla, puedes hacerlo desde aquí:
                </p>
                
                <!-- BUTTON -->
                <div style="text-align:center; margin:30px 0;">
                    <a href="%s"
                       style="display:inline-block;
                              background-color:#e63946;
                              color:#ffffff;
                              padding:12px 22px;
                              text-decoration:none;
                              border-radius:6px;
                              font-weight:bold;">
                        Cancelar cita
                    </a>
                </div>
                
                <!-- INFO -->
                <p style="font-size:13px; color:#555;">
                    Este enlace es personal y dejará de estar disponible antes de la cita.
                </p>
                
                <!-- FALLBACK -->
                <p style="font-size:12px; color:#777;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:
                </p>
                
                <p style="word-break:break-all;">
                    <a href="%s">Abrir enlace de cancelación</a>
                </p>
                
                <!-- FOOTER -->
                <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />
                
                <p style="font-size:12px; color:#999;">
                    Si no solicitaste esta cita, puedes ignorar este mensaje.
                </p>
                
            </div>
        
        </body>
        </html>
        """.formatted(name, cancelUrl, cancelUrl, cancelUrl);
    }
}
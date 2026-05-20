package com.sergio.application.notification;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@ApplicationScoped
public class BrevoEmailService {

    private static final Logger LOG = Logger.getLogger(BrevoEmailService.class);

    private Counter brevoRequestsCounter;
    private Counter brevoFailuresCounter;
    private Counter brevoAttachmentEmailsCounter;

    private Timer brevoSendTimer;
    private Timer brevoAttachmentTimer;

    @ConfigProperty(name = "brevo.api.key")
    String apiKey;

    @ConfigProperty(name = "brevo.sender.email")
    String senderEmail;

    @ConfigProperty(name = "brevo.sender.name")
    String senderName;

    @Inject
    MeterRegistry meterRegistry;

    private final HttpClient client = HttpClient.newHttpClient();

    @PostConstruct
    void initMetrics() {
        brevoRequestsCounter = meterRegistry.counter("brevo_requests");
        brevoFailuresCounter = meterRegistry.counter("brevo_failures");
        brevoAttachmentEmailsCounter = meterRegistry.counter("brevo_attachment_emails");

        brevoSendTimer = meterRegistry.timer("brevo_send_duration");
        brevoAttachmentTimer = meterRegistry.timer("brevo_attachment_duration");
    }

    public void send(String to, String subject, String html) {
        brevoSendTimer.record(() -> {
            try {
                String body = """
            {
              "sender": {
                "email": "%s",
                "name": "%s"
              },
              "to": [{
                "email": "%s"
              }],
              "subject": "%s",
              "htmlContent": %s
            }
            """.formatted(
                        senderEmail,
                        senderName,
                        to,
                        subject,
                        toJson(html)
                );

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                        .header("accept", "application/json")
                        .header("api-key", apiKey)
                        .header("content-type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build();

                LOG.infof(
                        "brevo_email_request to=%s subject=%s",
                        to,
                        subject
                );

                brevoRequestsCounter.increment();

                HttpResponse<String> response =
                        client.send(request, HttpResponse.BodyHandlers.ofString());

                meterRegistry.counter(
                        "brevo_responses",
                        "status",
                        String.valueOf(response.statusCode())
                ).increment();

                LOG.infof(
                        "brevo_email_response to=%s status=%d",
                        to,
                        response.statusCode()
                );

                if (response.statusCode() >= 300) {
                    brevoFailuresCounter.increment();
                    LOG.errorf(
                            "brevo_email_failed to=%s status=%d body=%s",
                            to,
                            response.statusCode(),
                            response.body()
                    );
                    throw new RuntimeException("Brevo error: " + response.body());
                }

            } catch (Exception e) {
                throw new RuntimeException("Error sending email via Brevo", e);
            }
        });
    }

    public void sendWithAttachment(String to, String subject, String html, String fileName, String content) {
        brevoAttachmentTimer.record(() -> {
            try {
                String body = """
        {
          "sender": {
            "email": "%s",
            "name": "%s"
          },
          "to": [{
            "email": "%s"
          }],
          "subject": "%s",
          "htmlContent": %s,
          "attachment": [{
            "name": "%s",
            "content": "%s"
          }]
        }
        """.formatted(
                        senderEmail,
                        senderName,
                        to,
                        subject,
                        toJson(html),
                        fileName,
                        java.util.Base64.getEncoder().encodeToString(content.getBytes())
                );

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                        .header("accept", "application/json")
                        .header("api-key", apiKey)
                        .header("content-type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build();

                brevoAttachmentEmailsCounter.increment();
                brevoRequestsCounter.increment();

                HttpResponse<String> response =
                        client.send(request, HttpResponse.BodyHandlers.ofString());

                meterRegistry.counter(
                        "brevo_responses",
                        "status",
                        String.valueOf(response.statusCode())
                ).increment();

                if (response.statusCode() >= 300) {
                    brevoFailuresCounter.increment();
                    throw new RuntimeException("Brevo error: " + response.body());
                }

            } catch (Exception e) {
                throw new RuntimeException("Error sending email with attachment", e);
            }
        });
    }

    private String toJson(String html) {
        return "\"" + html
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "")
                .replace("\r", "")
                + "\"";
    }
}

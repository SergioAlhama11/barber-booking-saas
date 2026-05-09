package com.sergio.application.notification;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@ApplicationScoped
public class BrevoEmailService {

    @ConfigProperty(name = "brevo.api.key")
    String apiKey;

    @ConfigProperty(name = "brevo.sender.email")
    String senderEmail;

    @ConfigProperty(name = "brevo.sender.name")
    String senderName;

    private final HttpClient client = HttpClient.newHttpClient();

    public void send(String to, String subject, String html) {
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

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                throw new RuntimeException("Brevo error: " + response.body());
            }

        } catch (Exception e) {
            throw new RuntimeException("Error sending email via Brevo", e);
        }

    }

    public void sendWithAttachment(String to, String subject, String html, String fileName, String content) {
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

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                throw new RuntimeException("Brevo error: " + response.body());
            }

        } catch (Exception e) {
            throw new RuntimeException("Error sending email with attachment", e);
        }
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

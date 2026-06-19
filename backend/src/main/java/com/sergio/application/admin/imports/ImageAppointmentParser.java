package com.sergio.application.admin.imports;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sergio.application.admin.imports.cache.AppointmentImportCacheService;
import com.sergio.application.security.RedisRateLimiter;
import com.sergio.domain.imports.ImportedAppointment;
import com.sergio.infrastructure.openai.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;

@ApplicationScoped
public class ImageAppointmentParser implements AppointmentDocumentParser {

    private final OpenAiClient openAiClient;
    private final ObjectMapper mapper;
    private final AppointmentImportCacheService cacheService;
    private final RedisRateLimiter rateLimiter;

    @ConfigProperty(name = "openai.api-key")
    String apiKey;

    public ImageAppointmentParser(@RestClient OpenAiClient openAiClient, ObjectMapper mapper, AppointmentImportCacheService cacheService, RedisRateLimiter rateLimiter) {
        this.openAiClient = openAiClient;
        this.mapper = mapper;
        this.cacheService = cacheService;
        this.rateLimiter = rateLimiter;
    }

    @Override
    public boolean supports(String contentType) {
        return Set.of("image/jpeg", "image/png", "image/webp").contains(contentType);
    }

    @Override
    public List<ImportedAppointment> parse(Long barbershopId, InputStream file) {
        try {
            byte[] imageBytes = file.readAllBytes();
            String hash = barbershopId + ":" + sha256(imageBytes);
            Optional<String> cached = cacheService.findByHash(hash);

            if (cached.isPresent()) {
                return mapResponse(cached.get());
            }

            rateLimiter.checkImportLimit(barbershopId);

            String responseBody = analyzeImage(imageBytes);

            cacheService.save(hash, responseBody);

            return mapResponse(responseBody);

        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read image", e);
        }
    }

    private String analyzeImage(byte[] imageBytes) {
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        OpenAiRequest request = buildRequest(base64Image);

        Response response = openAiClient.analyze("Bearer " + apiKey, request);

        String body = response.readEntity(String.class);

        if (response.getStatus() != 200) {
            throw new IllegalStateException("OpenAI request failed. Status=" + response.getStatus() + " Body=" + body);
        }

        return body;
    }

    private OpenAiRequest buildRequest(String base64Image) {
        String prompt = """
                            Analiza esta imagen de una agenda de barbería.
                            
                            La agenda pertenece a un único barbero ya seleccionado por el usuario.
                            
                            NO intentes identificar el nombre del barbero.
                            
                            NO intentes identificar el servicio.
                            
                            Extrae únicamente las citas visibles en la agenda.
                            
                            Para cada cita extrae:
                            
                            - customerName
                            - customerEmail (solo si aparece explícitamente)
                            - startTime
                            
                            Reglas importantes:
                            
                            - La mayoría de entradas contienen únicamente hora y nombre del cliente.
                            - No inventes nombres.
                            - No inventes horas.
                            - No inventes correos electrónicos.
                            - Si un dato no aparece claramente, utiliza null.
                            - Ignora anotaciones que no correspondan a citas.
                            - Ignora teléfonos, notas internas o comentarios del barbero.
                            - Extrae únicamente información que sea claramente legible.
                            
                            Asume:
                            
                            - Año actual: 2026
                            - Zona horaria: Europe/Madrid
                            
                            Devuelve startTime en formato ISO-8601 con offset.
                            
                            Ejemplo:
                            
                            {
                              "appointments": [
                                {
                                  "customerName": "Sergio",
                                  "customerEmail": null,
                                  "startTime": "2026-06-15T09:00:00+02:00"
                                }
                              ]
                            }
                            
                            Devuelve únicamente JSON válido.
                            
                            No añadas explicaciones.
                            
                            No añadas texto adicional.
                            
                            No utilices markdown.
                            
                            No envuelvas el JSON en bloques de código.
                         """;

        return new OpenAiRequest(
                "gpt-4.1",
                List.of(
                        new InputMessage(
                                "user",
                                List.of(
                                        new InputContent(
                                                "input_text",
                                                prompt,
                                                null
                                        ),
                                        new InputContent(
                                                "input_image",
                                                null,
                                                "data:image/png;base64," + base64Image
                                        )
                                )
                        )
                )
        );
    }

    private List<ImportedAppointment> mapResponse(String responseBody) {
        try {
            OpenAiResponse response = mapper.readValue(responseBody, OpenAiResponse.class);

            if (response.output() == null || response.output().isEmpty()) {
                throw new IllegalArgumentException("OpenAI returned empty output");
            }

            String appointmentsJson =
                    response.output()
                            .getFirst()
                            .content()
                            .getFirst()
                            .text();

            AppointmentAiResponse appointments = mapper.readValue(appointmentsJson, AppointmentAiResponse.class);

            return appointments.appointments()
                    .stream()
                    .map(this::toImportedAppointment)
                    .toList();

        } catch (Exception e) {
            throw new IllegalArgumentException("Unable to parse OpenAI response", e);
        }
    }

    private ImportedAppointment toImportedAppointment(AppointmentAiItem item) {
        return new ImportedAppointment(
                item.customerName(),
                item.customerEmail(),
                //item.barberName(),
                //item.serviceName(),
                parseInstant(item.startTime()),
                true,
                null
        );
    }

    private Instant parseInstant(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return OffsetDateTime.parse(value).toInstant();
    }

    private String sha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);

            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to generate hash", e);
        }
    }
}
package com.sergio.application.admin.imports;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.ws.rs.BadRequestException;

@ApplicationScoped
public class AppointmentDocumentParserResolver {

    private final Instance<AppointmentDocumentParser> parsers;

    public AppointmentDocumentParserResolver(Instance<AppointmentDocumentParser> parsers) {
        this.parsers = parsers;
    }

    public AppointmentDocumentParser resolve(String contentType) {
        for (AppointmentDocumentParser parser : parsers) {
            if (parser.supports(contentType)) {
                return parser;
            }
        }
        throw new BadRequestException("Unsupported file type");
    }
}

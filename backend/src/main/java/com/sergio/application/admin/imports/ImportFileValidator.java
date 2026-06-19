package com.sergio.application.admin.imports;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;

import java.util.Set;

@ApplicationScoped
public class ImportFileValidator {

    private static final long MAX_SIZE = 10 * 1024 * 1024;

    public void validate(String contentType, long size) {
        if (size <= 0) {
            throw new BadRequestException("Empty file");
        }

        if (size > MAX_SIZE) {
            throw new BadRequestException("Maximum file size is 10MB");
        }

        if (!isSupported(contentType)) {
            throw new BadRequestException("Unsupported file type");
        }

        if (contentType == null || contentType.isBlank()) {
            throw new BadRequestException("Missing content type");
        }
    }

    private boolean isSupported(String contentType) {
        return Set.of("application/pdf", "image/jpeg", "image/png", "image/webp").contains(contentType);
    }
}

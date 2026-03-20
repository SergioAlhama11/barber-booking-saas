package com.sergio.common.exception;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        ErrorCode error,
        String message,
        List<ValidationError> details,
        Instant timestamp
) {

    public ErrorResponse(ErrorCode error, String message) {
        this(error, message, null, Instant.now());
    }

    public ErrorResponse(ErrorCode error, String message, List<ValidationError> details) {
        this(error, message, details, Instant.now());
    }

    public record ValidationError(
            String field,
            String message
    ) {}
}

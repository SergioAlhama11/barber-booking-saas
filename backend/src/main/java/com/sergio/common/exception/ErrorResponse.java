package com.sergio.common.exception;

public record ErrorResponse(ErrorCode error, String message) {
}

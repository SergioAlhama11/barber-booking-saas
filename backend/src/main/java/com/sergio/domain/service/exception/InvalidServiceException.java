package com.sergio.domain.service.exception;

public class InvalidServiceException extends RuntimeException {

    public InvalidServiceException(String message) {
        super(message);
    }
}

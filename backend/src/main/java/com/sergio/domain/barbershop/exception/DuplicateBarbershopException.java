package com.sergio.domain.barbershop.exception;

public class DuplicateBarbershopException extends RuntimeException {

    public DuplicateBarbershopException(String slug) {
        super("Barbershop with slug '" + slug + "' already exists");
    }
}

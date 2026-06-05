package com.sergio.domain.admin.exception;

public class InvalidAdminCredentialsException extends RuntimeException {

    public InvalidAdminCredentialsException() {
        super("Invalid admin credentials");
    }
}
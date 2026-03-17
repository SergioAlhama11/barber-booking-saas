package com.sergio.common.exception;

import com.sergio.domain.barbershop.exception.DuplicateBarbershopException;
import io.quarkus.hibernate.validator.runtime.jaxrs.ResteasyReactiveViolationException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {

        // 🔴 409 - conflicto (duplicados)
        if (exception instanceof DuplicateBarbershopException ex) {
            return buildResponse(Response.Status.CONFLICT,
                    ErrorCode.BARBERSHOP_ALREADY_EXISTS,
                    ex.getMessage());
        }

        // 🔴 404 - no encontrado
        if (exception instanceof NotFoundException ex) {
            return buildResponse(Response.Status.NOT_FOUND,
                    ErrorCode.NOT_FOUND,
                    ex.getMessage());
        }

        // 🔴 400 - validación (Quarkus)
        if (exception instanceof ResteasyReactiveViolationException ex) {

            String message = ex.getConstraintViolations()
                    .stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .findFirst()
                    .orElse("Validation error");

            return buildResponse(Response.Status.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    message);
        }

        // 🔴 400 - validación
        if (exception instanceof ConstraintViolationException ex) {

            String message = ex.getConstraintViolations()
                    .stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .findFirst()
                    .orElse("Validation error");

            return buildResponse(Response.Status.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    message);
        }

        // 🔴 fallback
        return buildResponse(Response.Status.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_ERROR,
                "Unexpected error");
    }

    private Response buildResponse(Response.Status status, ErrorCode error, String message) {
        return Response.status(status)
                .entity(new ErrorResponse(error, message))
                .build();
    }
}

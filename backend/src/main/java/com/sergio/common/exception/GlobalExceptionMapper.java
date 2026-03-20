package com.sergio.common.exception;

import com.sergio.domain.appointment.exception.AppointmentConflictException;
import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import com.sergio.domain.barbershop.exception.DuplicateBarbershopException;
import com.sergio.domain.service.exception.DuplicateServiceException;
import com.sergio.domain.service.exception.InvalidServiceException;
import io.quarkus.hibernate.validator.runtime.jaxrs.ResteasyReactiveViolationException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {

        if (exception instanceof DuplicateBarbershopException ex) {
            return build(Response.Status.CONFLICT, ErrorCode.BARBERSHOP_ALREADY_EXISTS, ex.getMessage());
        }

        if (exception instanceof AppointmentConflictException ex) {
            return build(Response.Status.CONFLICT, ErrorCode.APPOINTMENT_CONFLICT, ex.getMessage());
        }

        if (exception instanceof InvalidAppointmentException ex) {
            return build(Response.Status.BAD_REQUEST, ErrorCode.INVALID_APPOINTMENT, ex.getMessage());
        }

        if (exception instanceof DuplicateServiceException ex) {
            return build(Response.Status.CONFLICT, ErrorCode.SERVICE_ALREADY_EXISTS, ex.getMessage());
        }

        if (exception instanceof InvalidServiceException ex) {
            return build(Response.Status.BAD_REQUEST, ErrorCode.INVALID_SERVICE, ex.getMessage());
        }

        if (exception instanceof NotFoundException ex) {
            return build(Response.Status.NOT_FOUND, ErrorCode.NOT_FOUND, ex.getMessage());
        }

        if (exception instanceof BadRequestException ex) {
            return build(Response.Status.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, ex.getMessage());
        }

        if (exception instanceof IllegalArgumentException ex &&
                ex.getMessage() != null &&
                ex.getMessage().contains("No enum constant")) {

            return build(
                    Response.Status.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    "Invalid filter value. Allowed values: FUTURE, PAST, ALL"
            );
        }

        // 🔴 IMPORTANTE: log
        exception.printStackTrace();

        return build(Response.Status.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_ERROR,
                "Unexpected error");
    }

    private Response build(Response.Status status, ErrorCode error, String message) {
        return Response.status(status)
                .entity(new ErrorResponse(error, message))
                .build();
    }
}

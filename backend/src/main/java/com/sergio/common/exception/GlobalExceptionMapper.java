package com.sergio.common.exception;

import com.sergio.domain.appointment.exception.AppointmentConflictException;
import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import com.sergio.domain.barber.exception.BarberDeletionNotAllowedException;
import com.sergio.domain.barbershop.exception.BarbershopDeletionNotAllowedException;
import com.sergio.domain.barbershop.exception.DuplicateBarbershopException;
import com.sergio.domain.service.exception.DuplicateServiceException;
import com.sergio.domain.service.exception.InvalidServiceException;
import com.sergio.domain.service.exception.ServiceDeletionNotAllowedException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG =
            Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Throwable exception) {

        // =========================
        // BUSINESS ERRORS
        // =========================

        if (exception instanceof DuplicateBarbershopException ex) {

            LOG.warnf(
                    "duplicate_barbershop_error message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.CONFLICT,
                    ErrorCode.BARBERSHOP_ALREADY_EXISTS,
                    ex.getMessage()
            );
        }

        if (exception instanceof AppointmentConflictException ex) {

            LOG.warnf(
                    "appointment_conflict_error message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.CONFLICT,
                    ErrorCode.APPOINTMENT_CONFLICT,
                    ex.getMessage()
            );
        }

        if (exception instanceof InvalidAppointmentException ex) {

            LOG.warnf(
                    "invalid_appointment_error message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.BAD_REQUEST,
                    ErrorCode.INVALID_APPOINTMENT,
                    ex.getMessage()
            );
        }

        if (exception instanceof DuplicateServiceException ex) {

            LOG.warnf(
                    "duplicate_service_error message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.CONFLICT,
                    ErrorCode.SERVICE_ALREADY_EXISTS,
                    ex.getMessage()
            );
        }

        if (exception instanceof InvalidServiceException ex) {

            LOG.warnf(
                    "invalid_service_error message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.BAD_REQUEST,
                    ErrorCode.INVALID_SERVICE,
                    ex.getMessage()
            );
        }

        // =========================
        // HTTP ERRORS
        // =========================

        if (exception instanceof NotFoundException ex) {

            LOG.warnf(
                    "resource_not_found message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.NOT_FOUND,
                    ErrorCode.NOT_FOUND,
                    ex.getMessage()
            );
        }

        if (exception instanceof ForbiddenException ex) {

            LOG.warnf(
                    "access_denied message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.FORBIDDEN,
                    ErrorCode.ACCESS_DENIED,
                    ex.getMessage()
            );
        }

        if (exception instanceof BadRequestException ex) {

            LOG.warnf(
                    "bad_request_error message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    ex.getMessage()
            );
        }

        // =========================
        // ENUM VALIDATION
        // =========================

        if (exception instanceof IllegalArgumentException ex &&
                ex.getMessage() != null &&
                ex.getMessage().contains("No enum constant")) {

            LOG.warnf(
                    "invalid_enum_value message=%s",
                    ex.getMessage()
            );

            return build(
                    Response.Status.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    "Invalid filter value. Allowed values: FUTURE, PAST, ALL"
            );
        }

        // =========================
        // DELETE RESTRICTIONS
        // =========================

        if (exception instanceof BarberDeletionNotAllowedException ex) {
            return build(
                    Response.Status.CONFLICT,
                    ErrorCode.DELETE_NOT_ALLOWED,
                    ex.getMessage()
            );
        }

        if (exception instanceof BarbershopDeletionNotAllowedException ex) {
            return build(
                    Response.Status.CONFLICT,
                    ErrorCode.DELETE_NOT_ALLOWED,
                    ex.getMessage()
            );
        }

        if (exception instanceof ServiceDeletionNotAllowedException ex) {
            return build(
                    Response.Status.CONFLICT,
                    ErrorCode.DELETE_NOT_ALLOWED,
                    ex.getMessage()
            );
        }

        // =========================
        // UNEXPECTED ERROR
        // =========================

        LOG.error("unexpected_error", exception);

        return build(
                Response.Status.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_ERROR,
                "Unexpected error"
        );
    }

    private Response build(
            Response.Status status,
            ErrorCode error,
            String message
    ) {

        return Response.status(status)
                .entity(new ErrorResponse(error, message))
                .build();
    }
}
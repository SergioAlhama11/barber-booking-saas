package com.sergio.common.exception;

import io.quarkus.hibernate.validator.runtime.jaxrs.ResteasyReactiveViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

@Provider
public class ValidationExceptionMapper
        implements ExceptionMapper<ResteasyReactiveViolationException> {

    private static final Logger LOG =
            Logger.getLogger(ValidationExceptionMapper.class);

    @Override
    public Response toResponse(ResteasyReactiveViolationException exception) {

        var details = exception.getConstraintViolations()
                .stream()
                .map(v -> new ErrorResponse.ValidationError(
                        v.getPropertyPath()
                                .toString()
                                .replaceAll(".*\\.", ""),
                        v.getMessage()
                ))
                .toList();

        LOG.warnf(
                "validation_failed violations=%d",
                details.size()
        );

        return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(
                        ErrorCode.VALIDATION_ERROR,
                        "Validation failed",
                        details
                ))
                .build();
    }
}
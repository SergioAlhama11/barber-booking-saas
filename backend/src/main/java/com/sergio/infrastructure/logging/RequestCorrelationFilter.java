package com.sergio.infrastructure.logging;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;
import org.jboss.logging.MDC;

import java.io.IOException;
import java.util.UUID;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class RequestCorrelationFilter
        implements ContainerRequestFilter, ContainerResponseFilter {

    private static final Logger LOG =
            Logger.getLogger(RequestCorrelationFilter.class);

    public static final String REQUEST_ID_HEADER = "X-Request-Id";

    public static final String MDC_REQUEST_ID = "requestId";
    public static final String MDC_METHOD = "method";
    public static final String MDC_PATH = "path";
    public static final String MDC_START_TIME = "startTime";

    @Override
    public void filter(ContainerRequestContext requestContext)
            throws IOException {

        String requestId =
                requestContext.getHeaderString(REQUEST_ID_HEADER);

        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        MDC.put(MDC_REQUEST_ID, requestId);
        MDC.put(MDC_METHOD, requestContext.getMethod());
        MDC.put(MDC_PATH, requestContext.getUriInfo().getPath());
        MDC.put(MDC_START_TIME, System.currentTimeMillis());

        LOG.debugf(
                "http_request_started method=%s path=%s",
                requestContext.getMethod(),
                requestContext.getUriInfo().getPath()
        );
    }

    @Override
    public void filter(
            ContainerRequestContext requestContext,
            ContainerResponseContext responseContext
    ) throws IOException {

        try {

            Object requestId = MDC.get(MDC_REQUEST_ID);

            if (requestId != null) {
                responseContext.getHeaders()
                        .add(REQUEST_ID_HEADER, requestId.toString());
            }

            Object startTime = MDC.get(MDC_START_TIME);

            long duration = -1;

            if (startTime != null) {
                long start = Long.parseLong(startTime.toString());
                duration = System.currentTimeMillis() - start;
            }

            LOG.infof(
                    "http_request_completed method=%s path=%s status=%d durationMs=%d",
                    requestContext.getMethod(),
                    requestContext.getUriInfo().getPath(),
                    responseContext.getStatus(),
                    duration
            );

        } finally {
            MDC.clear();
        }
    }
}
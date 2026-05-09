package com.sergio.api.auth;

import com.sergio.api.auth.dto.OtpResponse;
import com.sergio.api.auth.dto.ExchangeMagicRequest;
import com.sergio.api.auth.dto.ExchangeMagicResponse;
import com.sergio.api.auth.dto.RequestOtpRequest;
import com.sergio.api.auth.dto.SessionResponse;
import com.sergio.api.auth.dto.VerifyOtpRequest;
import com.sergio.api.auth.dto.VerifyOtpResponse;
import com.sergio.application.auth.AuthService;
import com.sergio.application.auth.AuthCookieService;
import com.sergio.application.auth.MagicSession;
import com.sergio.common.util.AuthUtils;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.CookieParam;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    private static final int OTP_TTL_SECONDS = 300;

    @Inject
    AuthService authService;

    @Inject
    AuthCookieService authCookieService;

    @Context
    HttpServerRequest request;

    @Context
    HttpServerResponse response;

    @POST
    @Path("/request-otp")
    public Response requestOtp(RequestOtpRequest otpRequest) {
        String ip = request.remoteAddress().host();
        authService.requestOtp(otpRequest.email(), ip, otpRequest.slug());
        return Response.ok(new OtpResponse(OTP_TTL_SECONDS)).build();
    }

    @POST
    @Path("/verify-otp")
    public Response verifyOtp(VerifyOtpRequest request) {
        String email = request.email().trim().toLowerCase();
        String token = authService.verifyOtp(
                email,
                request.code()
        );
        authCookieService.writeSessionCookie(response, token, authService.getSessionTtlSeconds());
        return Response.ok(new VerifyOtpResponse(email)).build();
    }

    @GET
    @Path("/session")
    public Response session(
            @HeaderParam("Authorization") String authHeader,
            @CookieParam(AuthCookieService.SESSION_COOKIE_NAME) String sessionCookie
    ) {
        try {
            String token = AuthUtils.extractToken(authHeader, sessionCookie);
            String email = authService.getEmailFromSession(token);
            return Response.ok(new SessionResponse(email)).build();
        } catch (ForbiddenException ignored) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
    }

    @POST
    @Path("/exchange-magic")
    public Response exchangeMagic(ExchangeMagicRequest request) {
        MagicSession magicSession = authService.exchangeMagicSession(request.token());
        String sessionToken = authService.createSession(magicSession.email(), request.token());
        authCookieService.writeSessionCookie(response, sessionToken, authService.getSessionTtlSeconds());

        return Response.ok(
                new ExchangeMagicResponse(
                        magicSession.email(),
                        magicSession.appointmentId()
                )
        ).build();
    }

    @POST
    @Path("/logout")
    public Response logout(
            @HeaderParam("Authorization") String authHeader,
            @CookieParam(AuthCookieService.SESSION_COOKIE_NAME) String sessionCookie
    ) {
        try {
            String token = AuthUtils.extractToken(authHeader, sessionCookie);
            authService.invalidateSession(token);
        } catch (Exception ignored) {
            // No active session to invalidate.
        }

        authCookieService.clearSessionCookie(response);
        return Response.noContent().build();
    }
}

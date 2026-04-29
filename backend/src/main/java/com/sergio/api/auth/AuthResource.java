package com.sergio.api.auth;

import com.sergio.api.auth.dto.OtpResponse;
import com.sergio.api.auth.dto.ExchangeMagicRequest;
import com.sergio.api.auth.dto.ExchangeMagicResponse;
import com.sergio.api.auth.dto.RequestOtpRequest;
import com.sergio.api.auth.dto.VerifyOtpRequest;
import com.sergio.api.auth.dto.VerifyOtpResponse;
import com.sergio.application.auth.AuthService;
import com.sergio.application.auth.MagicSession;
import io.vertx.core.http.HttpServerRequest;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
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

    @Context
    HttpServerRequest request;

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
        String token = authService.verifyOtp(
                request.email(),
                request.code()
        );
        return Response.ok(new VerifyOtpResponse(token)).build();
    }

    @POST
    @Path("/exchange-magic")
    public Response exchangeMagic(ExchangeMagicRequest request) {
        MagicSession magicSession = authService.exchangeMagicSession(request.token());
        String sessionToken = authService.createSession(magicSession.email());

        return Response.ok(
                new ExchangeMagicResponse(
                        sessionToken,
                        magicSession.email(),
                        magicSession.appointmentId()
                )
        ).build();
    }
}

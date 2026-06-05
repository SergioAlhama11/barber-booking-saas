package com.sergio.infrastructure.security;

import com.sergio.application.admin.auth.AuthenticatedAdmin;
import jakarta.enterprise.context.RequestScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;

@RequestScoped
public class AuthenticatedAdminProducer {

    @Inject
    JsonWebToken jwt;

    @Produces
    public AuthenticatedAdmin authenticatedAdmin() {

        Object barbershopIdClaim = jwt.getClaim("barbershopId");
        Object barberIdClaim = jwt.getClaim("barberId");

        Long barbershopId =
                barbershopIdClaim == null
                        ? null
                        : Long.valueOf(barbershopIdClaim.toString());

        Long barberId =
                barberIdClaim == null
                        ? null
                        : Long.valueOf(barberIdClaim.toString());

        return new AuthenticatedAdmin(
                Long.valueOf(jwt.getSubject()),
                jwt.getClaim("email"),
                barbershopId,
                barberId,
                jwt.getGroups()
        );
    }
}
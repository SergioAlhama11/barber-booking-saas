package com.sergio.application.admin.auth;

import com.sergio.domain.admin.AdminUser;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class JwtService {

    private static final String ISSUER = "barber-saas";
    private static final Duration TOKEN_DURATION = Duration.ofDays(7);

    public String generate(AdminUser adminUser) {

        var builder = Jwt.issuer(ISSUER)
                .subject(adminUser.getId().toString())
                .groups(Set.of(adminUser.getRole().name()))
                .claim("email", adminUser.getEmail());

        if (adminUser.getBarbershopId() != null) {
            builder.claim("barbershopId", adminUser.getBarbershopId());
        }

        if (adminUser.getBarberId() != null) {
            builder.claim("barberId", adminUser.getBarberId());
        }

        return builder
                .expiresIn(TOKEN_DURATION)
                .sign();
    }
}
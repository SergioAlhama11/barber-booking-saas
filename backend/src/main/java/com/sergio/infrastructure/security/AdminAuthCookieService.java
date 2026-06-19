package com.sergio.infrastructure.security;

import com.sergio.infrastructure.config.AppConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.NewCookie;

@ApplicationScoped
public class AdminAuthCookieService {

    public static final String COOKIE_NAME = "admin_token";

    @Inject
    AppConfig appConfig;

    public NewCookie buildSessionCookie(String token, int maxAgeSeconds) {

        return new NewCookie.Builder(COOKIE_NAME)
                .value(token)
                .path("/api/admin")
                .httpOnly(true)
                .secure(appConfig.isSecureCookies())
                .sameSite(
                        appConfig.isSecureCookies()
                                ? NewCookie.SameSite.NONE
                                : NewCookie.SameSite.LAX
                )
                .maxAge(maxAgeSeconds)
                .build();
    }

    public NewCookie buildExpiredCookie() {

        return new NewCookie.Builder(COOKIE_NAME)
                .value("")
                .path("/api/admin")
                .httpOnly(true)
                .secure(appConfig.isSecureCookies())
                .sameSite(
                        appConfig.isSecureCookies()
                                ? NewCookie.SameSite.NONE
                                : NewCookie.SameSite.LAX
                )
                .maxAge(0)
                .build();
    }
}

package com.sergio.application.auth;

import com.sergio.infrastructure.config.AppConfig;
import io.vertx.core.http.Cookie;
import io.vertx.core.http.CookieSameSite;
import io.vertx.core.http.HttpServerResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class AuthCookieService {

    public static final String SESSION_COOKIE_NAME = "bb_session";

    @Inject
    AppConfig appConfig;

    public void writeSessionCookie(HttpServerResponse response, String token, int maxAgeSeconds) {
        Cookie cookie = Cookie.cookie(SESSION_COOKIE_NAME, token)
                .setPath("/")
                .setHttpOnly(true)
                .setSecure(appConfig.isProd())
                .setSameSite(CookieSameSite.LAX)
                .setMaxAge(maxAgeSeconds);

        response.addCookie(cookie);
    }

    public void clearSessionCookie(HttpServerResponse response) {
        Cookie cookie = Cookie.cookie(SESSION_COOKIE_NAME, "")
                .setPath("/")
                .setHttpOnly(true)
                .setSecure(appConfig.isProd())
                .setSameSite(CookieSameSite.LAX)
                .setMaxAge(0);

        response.addCookie(cookie);
    }
}

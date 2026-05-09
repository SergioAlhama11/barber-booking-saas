package com.sergio.common.util;

public class AuthUtils {

    public static String extractToken(String authHeader, String cookieToken) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        if (cookieToken != null && !cookieToken.isBlank()) {
            return cookieToken;
        }

        throw new jakarta.ws.rs.ForbiddenException("Missing or invalid authentication token");
    }

    public static String extractToken(String authHeader) {
        return extractToken(authHeader, null);
    }
}

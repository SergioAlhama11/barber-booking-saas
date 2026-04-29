package com.sergio.common.util;

public class AuthUtils {

    public static String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new jakarta.ws.rs.ForbiddenException("Missing or invalid Authorization header");
        }
        return authHeader.substring(7);
    }
}

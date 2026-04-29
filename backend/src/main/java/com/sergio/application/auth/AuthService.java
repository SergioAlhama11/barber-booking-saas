package com.sergio.application.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sergio.application.notification.EmailService;
import com.sergio.application.security.RedisRateLimiter;
import com.sergio.infrastructure.config.AppConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;

@ApplicationScoped
public class AuthService {

    private static final int OTP_TTL_SECONDS = 300;      // 5 min
    private static final int SESSION_TTL_SECONDS = 1800; // 30 min

    private static final String OTP_PREFIX = "otp:";
    private static final String SESSION_PREFIX = "session:";
    private static final String MAGIC_PREFIX = "session:magic:";
    private static final String OTP_ATTEMPTS_PREFIX = "otp:attempts:";

    private static final int MAX_ATTEMPTS = 5;

    private static final SecureRandom random = new SecureRandom();

    @Inject
    RedisService redisService;

    @Inject
    EmailService emailService;

    @Inject
    RedisRateLimiter redisRateLimiter;

    @Inject
    AppConfig appConfig;

    @Inject
    ObjectMapper objectMapper;

    // =========================
    // OTP REQUEST
    // =========================

    public void requestOtp(String email, String ip, String slug) {
        email = normalizeEmail(email);

        redisRateLimiter.checkOtpLimit(email);
        redisRateLimiter.checkOtpLimit(ip);

        // limpiar estado previo
        redisService.delete(OTP_PREFIX + email);
        redisService.delete(OTP_ATTEMPTS_PREFIX + email);

        String code = generateOtp();

        // guardar OTP hasheado
        redisService.set(
                OTP_PREFIX + email,
                hash(code),
                Duration.ofSeconds(OTP_TTL_SECONDS)
        );

        String magicToken = createMagicSession(email, null);

        String magicUrl = appConfig.getFrontendUrl()
                + "/barbershops/" + slug
                + "/my-bookings?token=" + magicToken;

        emailService.sendOtp(email, code, magicUrl);
    }

    // =========================
    // OTP VERIFY
    // =========================

    public String verifyOtp(String email, String code) {
        email = normalizeEmail(email);

        String otpKey = OTP_PREFIX + email;
        String storedCode = redisService.get(otpKey);

        // control de intentos
        String attemptsKey = OTP_ATTEMPTS_PREFIX + email;
        int attempts = redisService.increment(
                attemptsKey,
                Duration.ofSeconds(OTP_TTL_SECONDS)
        );

        if (attempts > MAX_ATTEMPTS) {
            redisService.delete(otpKey);
            throw new ForbiddenException("Too many attempts");
        }

        if (storedCode == null) {
            throw new ForbiddenException("OTP_EXPIRED");
        }

        if (!storedCode.equals(hash(code))) {
            throw new ForbiddenException("OTP_INVALID");
        }

        // limpiar OTP
        redisService.delete(otpKey);
        redisService.delete(attemptsKey);

        return createSession(email);
    }

    // =========================
    // SESSION RESOLUTION
    // =========================

    public String getEmailFromSession(String token) {
        if (token == null || token.isBlank()) {
            throw new ForbiddenException("Missing token");
        }

        String normalKey = SESSION_PREFIX + token;

        String email = redisService.get(normalKey);
        if (email != null) {
            refreshSession(normalKey, email);
            return email;
        }

        throw new ForbiddenException("Session expired or invalid");
    }

    // =========================
    // SESSION CREATION
    // =========================

    public String createSession(String email) {
        email = normalizeEmail(email);

        String token = generateSecureToken();

        redisService.set(
                SESSION_PREFIX + token,
                email,
                Duration.ofSeconds(SESSION_TTL_SECONDS)
        );

        return token;
    }

    public MagicSession exchangeMagicSession(String token) {
        if (token == null || token.isBlank()) {
            throw new ForbiddenException("Missing magic token");
        }

        MagicSession magicSession = getMagicSession(token);

        if (magicSession == null) {
            throw new ForbiddenException("Magic session expired or invalid");
        }

        return magicSession;
    }

    public MagicSession getMagicSession(String token) {
        String data = redisService.get(MAGIC_PREFIX + token);

        if (data == null) {
            return null;
        }

        redisService.delete(MAGIC_PREFIX + token);

        try {
            return objectMapper.readValue(data, MagicSession.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid magic session", e);
        }
    }

    public String createMagicSession(String email, Long appointmentId) {
        email = normalizeEmail(email);

        String token = generateSecureToken();

        MagicSession session = new MagicSession(email, appointmentId);

        try {
            redisService.set(
                    MAGIC_PREFIX + token,
                    objectMapper.writeValueAsString(session),
                    Duration.ofSeconds(OTP_TTL_SECONDS)
            );
        } catch (Exception e) {
            throw new RuntimeException("Error serializing magic session", e);
        }

        return token;
    }

    // =========================
    // INTERNAL HELPERS
    // =========================

    private void refreshSession(String key, String email) {
        redisService.set(
                key,
                email,
                Duration.ofSeconds(SESSION_TTL_SECONDS)
        );
    }

    private String generateOtp() {
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return java.util.Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error hashing value", e);
        }
    }
}

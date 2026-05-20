package com.sergio.application.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sergio.application.notification.EmailService;
import com.sergio.application.security.RedisRateLimiter;
import com.sergio.infrastructure.config.AppConfig;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AuthService {

    private static final int OTP_TTL_SECONDS = 300;      // 5 min
    private static final int MAGIC_SESSION_TTL_SECONDS = 86400; // 24 h
    private static final int SESSION_TTL_SECONDS = 1800; // 30 min

    private static final String OTP_PREFIX = "otp:";
    private static final String SESSION_PREFIX = "session:";
    private static final String SESSION_INDEX_PREFIX = "session:index:";
    private static final String MAGIC_PREFIX = "session:magic:";
    private static final String MAGIC_INDEX_PREFIX = "session:magic-index:";
    private static final String SESSION_MAGIC_SOURCE_PREFIX = "session:magic-source:";
    private static final String OTP_ATTEMPTS_PREFIX = "otp:attempts:";

    private static final int MAX_ATTEMPTS = 5;

    private static final SecureRandom random = new SecureRandom();

    private static final Logger LOG = Logger.getLogger(AuthService.class);

    private Counter otpRequestsCounter;
    private Counter otpVerifiedCounter;
    private Counter otpInvalidCounter;
    private Counter otpExpiredCounter;
    private Counter sessionsCreatedCounter;
    private Counter sessionInvalidCounter;
    private Counter magicSessionsCreatedCounter;

    private Timer otpRequestTimer;
    private Timer otpVerifyTimer;

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

    @Inject
    MeterRegistry meterRegistry;

    @PostConstruct
    void initMetrics() {
        otpRequestsCounter = meterRegistry.counter("otp_requests");
        otpVerifiedCounter = meterRegistry.counter("otp_verified");
        otpInvalidCounter = meterRegistry.counter("otp_invalid");
        otpExpiredCounter = meterRegistry.counter("otp_expired");
        sessionsCreatedCounter = meterRegistry.counter("sessions_created");
        sessionInvalidCounter = meterRegistry.counter("session_invalid");
        magicSessionsCreatedCounter = meterRegistry.counter("magic_sessions_created");

        otpRequestTimer = meterRegistry.timer("otp_request_duration");
        otpVerifyTimer = meterRegistry.timer("otp_verify_duration");
    }

    // =========================
    // OTP REQUEST
    // =========================

    public void requestOtp(String email, String ip, String slug) {
        final String normalizedEmail = normalizeEmail(email);

        otpRequestTimer.record(() -> {
            otpRequestsCounter.increment();

            LOG.infof(
                    "otp_requested email=%s ip=%s slug=%s",
                    normalizedEmail,
                    ip,
                    slug
            );

            redisRateLimiter.checkOtpLimit(normalizedEmail);
            redisRateLimiter.checkOtpLimit(ip);

            // limpiar estado previo
            redisService.delete(OTP_PREFIX + normalizedEmail);
            redisService.delete(OTP_ATTEMPTS_PREFIX + normalizedEmail);

            String code = generateOtp();

            // guardar OTP hasheado
            redisService.set(
                    OTP_PREFIX + normalizedEmail,
                    hash(code),
                    Duration.ofSeconds(OTP_TTL_SECONDS)
            );

            String magicToken = createMagicSession(normalizedEmail, null);

            String magicUrl = appConfig.getFrontendUrl()
                    + "/barbershops/" + slug
                    + "/my-bookings?token=" + magicToken;

            LOG.infof(
                    "otp_sent email=%s",
                    normalizedEmail
            );

            emailService.sendOtp(normalizedEmail, code, magicUrl);
        });
    }

    // =========================
    // OTP VERIFY
    // =========================

    public String verifyOtp(String email, String code) {
        final String normalizedEmail = normalizeEmail(email);

        return otpVerifyTimer.record(() -> {
            LOG.infof(
                    "otp_verification_requested email=%s",
                    normalizedEmail
            );

            String otpKey = OTP_PREFIX + normalizedEmail;
            String storedCode = redisService.get(otpKey);

            // control de intentos
            String attemptsKey = OTP_ATTEMPTS_PREFIX + normalizedEmail;
            int attempts = redisService.increment(
                    attemptsKey,
                    Duration.ofSeconds(OTP_TTL_SECONDS)
            );

            if (attempts > MAX_ATTEMPTS) {
                redisService.delete(otpKey);
                LOG.warnf(
                        "otp_attempts_exceeded email=%s attempts=%d",
                        normalizedEmail,
                        attempts
                );
                throw new ForbiddenException("Too many attempts");
            }

            if (storedCode == null) {
                otpExpiredCounter.increment();
                LOG.warnf(
                        "otp_expired email=%s",
                        normalizedEmail
                );
                throw new ForbiddenException("OTP_EXPIRED");
            }

            if (!storedCode.equals(hash(code))) {
                otpInvalidCounter.increment();
                LOG.warnf(
                        "otp_invalid email=%s attempts=%d",
                        normalizedEmail,
                        attempts
                );
                throw new ForbiddenException("OTP_INVALID");
            }

            // limpiar OTP
            redisService.delete(otpKey);
            redisService.delete(attemptsKey);

            LOG.infof(
                    "otp_verified email=%s",
                    normalizedEmail
            );

            otpVerifiedCounter.increment();

            return createSession(normalizedEmail);
        });
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

            LOG.infof(
                    "session_restored email=%s",
                    email
            );

            refreshSession(normalKey, email);
            rememberSessionToken(email, token);
            refreshMagicSource(token);
            return email;
        }

        LOG.warn("session_invalid");
        sessionInvalidCounter.increment();

        throw new ForbiddenException("Session expired or invalid");
    }

    // =========================
    // SESSION CREATION
    // =========================

    public String createSession(String email) {
        return createSession(email, null);
    }

    public String createSession(String email, String sourceMagicToken) {
        email = normalizeEmail(email);

        String token = generateSecureToken();

        redisService.set(
                SESSION_PREFIX + token,
                email,
                Duration.ofSeconds(SESSION_TTL_SECONDS)
        );

        sessionsCreatedCounter.increment();

        LOG.infof(
                "session_created email=%s",
                email
        );

        rememberSessionToken(email, token);

        if (sourceMagicToken != null && !sourceMagicToken.isBlank()) {
            redisService.set(
                SESSION_MAGIC_SOURCE_PREFIX + token,
                sourceMagicToken,
                    Duration.ofSeconds(SESSION_TTL_SECONDS)
            );
        }

        return token;
    }

    public void invalidateSession(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        String email = redisService.get(SESSION_PREFIX + token);
        String sourceMagicToken = redisService.get(SESSION_MAGIC_SOURCE_PREFIX + token);
        if (sourceMagicToken != null && !sourceMagicToken.isBlank()) {
            redisService.delete(MAGIC_PREFIX + sourceMagicToken);
            redisService.delete(SESSION_MAGIC_SOURCE_PREFIX + token);
        }

        if (email != null && !email.isBlank()) {
            invalidateSessionsForEmail(email);
            invalidateMagicSessionsForEmail(email);
            return;
        }

        redisService.delete(SESSION_PREFIX + token);
    }

    public MagicSession exchangeMagicSession(String token) {
        if (token == null || token.isBlank()) {
            throw new ForbiddenException("Missing magic token");
        }

        MagicSession magicSession = getMagicSession(token);

        if (magicSession == null) {
            LOG.warn("magic_session_invalid");
            throw new ForbiddenException("Magic session expired or invalid");
        }

        LOG.infof(
                "magic_session_restored email=%s appointmentId=%s",
                magicSession.email(),
                magicSession.appointmentId()
        );

        return magicSession;
    }

    public MagicSession getMagicSession(String token) {
        String data = redisService.get(MAGIC_PREFIX + token);

        if (data == null) {
            return null;
        }

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
                    Duration.ofSeconds(MAGIC_SESSION_TTL_SECONDS)
            );

            magicSessionsCreatedCounter.increment();

            LOG.infof(
                    "magic_session_created email=%s appointmentId=%s",
                    email,
                    appointmentId
            );

            rememberMagicToken(email, token);
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

    private void refreshMagicSource(String token) {
        String sourceMagicToken = redisService.get(SESSION_MAGIC_SOURCE_PREFIX + token);
        if (sourceMagicToken == null || sourceMagicToken.isBlank()) {
            return;
        }

        redisService.set(
                SESSION_MAGIC_SOURCE_PREFIX + token,
                sourceMagicToken,
                Duration.ofSeconds(SESSION_TTL_SECONDS)
        );
    }

    private void rememberSessionToken(String email, String token) {
        try {
            List<String> tokens = readSessionTokens(email);
            if (!tokens.contains(token)) {
                tokens.add(token);
            }

            redisService.set(
                    SESSION_INDEX_PREFIX + email,
                    objectMapper.writeValueAsString(tokens),
                    Duration.ofSeconds(SESSION_TTL_SECONDS)
            );
        } catch (Exception e) {
            throw new RuntimeException("Error storing session index", e);
        }
    }

    private void rememberMagicToken(String email, String token) throws Exception {
        List<String> tokens = readMagicTokens(email);
        if (!tokens.contains(token)) {
            tokens.add(token);
        }

        redisService.set(
                MAGIC_INDEX_PREFIX + email,
                objectMapper.writeValueAsString(tokens),
                Duration.ofSeconds(MAGIC_SESSION_TTL_SECONDS)
        );
    }

    private void invalidateMagicSessionsForEmail(String email) {
        try {
            List<String> tokens = readMagicTokens(email);
            for (String magicToken : tokens) {
                redisService.delete(MAGIC_PREFIX + magicToken);
            }
        } catch (Exception ignored) {
            // If the magic index is malformed, just clear the index key below.
        }

        redisService.delete(MAGIC_INDEX_PREFIX + email);
    }

    private void invalidateSessionsForEmail(String email) {
        try {
            List<String> tokens = readSessionTokens(email);
            for (String sessionToken : tokens) {
                redisService.delete(SESSION_PREFIX + sessionToken);
                redisService.delete(SESSION_MAGIC_SOURCE_PREFIX + sessionToken);
            }
        } catch (Exception ignored) {
            // If the session index is malformed, just clear the index key below.
        }

        redisService.delete(SESSION_INDEX_PREFIX + email);

        LOG.infof(
                "session_invalidated email=%s",
                email
        );
    }

    private List<String> readMagicTokens(String email) throws Exception {
        String data = redisService.get(MAGIC_INDEX_PREFIX + email);
        if (data == null || data.isBlank()) {
            return new ArrayList<>();
        }

        return objectMapper.readValue(
                data,
                objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
        );
    }

    private List<String> readSessionTokens(String email) throws Exception {
        String data = redisService.get(SESSION_INDEX_PREFIX + email);
        if (data == null || data.isBlank()) {
            return new ArrayList<>();
        }

        return objectMapper.readValue(
                data,
                objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
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

    public int getSessionTtlSeconds() {
        return SESSION_TTL_SECONDS;
    }
}

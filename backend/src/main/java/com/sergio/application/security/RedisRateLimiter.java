package com.sergio.application.security;

import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.quarkus.redis.datasource.sortedset.ScoreRange;
import io.quarkus.redis.datasource.sortedset.SortedSetCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class RedisRateLimiter {

    private final SortedSetCommands<String, String> zset;
    private final KeyCommands<String> keys;

    @Inject
    public RedisRateLimiter(RedisDataSource redis) {
        this.zset = redis.sortedSet(String.class);
        this.keys = redis.key();
    }

    // =========================
    // GENERIC SLIDING WINDOW
    // =========================

    private void checkLimit(String key, int max, Duration window, String message) {

        long now = Instant.now().toEpochMilli();
        long windowStart = now - window.toMillis();

        // 🧹 limpiar antiguos
        zset.zremrangebyscore(key, ScoreRange.from(0.0, (double) windowStart));

        long count = zset.zcard(key);

        if (count >= max) {
            throw new InvalidAppointmentException(message);
        }

        String value = now + "-" + UUID.randomUUID();

        zset.zadd(key, now, value);

        keys.expire(key, window.getSeconds());
    }

    // =========================
    // CREATE LIMIT (más restrictivo)
    // =========================

    public void checkCreateLimit(String ip, String email) {

        System.out.println("🔥 Redis limiter ejecutado");

        checkLimit(
                "rl:create:ip:" + ip,
                2,
                Duration.ofMinutes(1),
                "Too many bookings from this IP"
        );

        checkLimit(
                "rl:create:email:" + email,
                2,
                Duration.ofMinutes(1),
                "Too many bookings for this email"
        );
    }

    // =========================
    // RESEND LIMIT (más permisivo)
    // =========================

    public void checkResendLimit(String ip, String email) {

        checkLimit(
                "rl:resend:ip:" + ip,
                5,
                Duration.ofMinutes(1),
                "Too many requests from this IP"
        );

        checkLimit(
                "rl:resend:email:" + email,
                5,
                Duration.ofMinutes(1),
                "Too many requests for this email"
        );
    }

    public void checkOtpLimit(String email) {
        checkLimit(
                "rl:otp:email:" + email,
                3, // max intentos
                Duration.ofMinutes(5),
                "Too many OTP requests. Try again later"
        );
    }

    public void checkOtpVerifyLimit(String email) {
        checkLimit(
                "rl:otp:verify:" + email,
                5,
                Duration.ofMinutes(5),
                "Too many attempts"
        );
    }
}
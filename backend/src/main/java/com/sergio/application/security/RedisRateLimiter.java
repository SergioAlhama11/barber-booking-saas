package com.sergio.application.security;

import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.quarkus.redis.datasource.sortedset.ScoreRange;
import io.quarkus.redis.datasource.sortedset.SortedSetCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class RedisRateLimiter {

    private final SortedSetCommands<String, String> zset;
    private final KeyCommands<String> keys;

    private static final Logger LOG = Logger.getLogger(RedisRateLimiter.class);

    private Counter rateLimitExceededCounter;
    private Counter rateLimitAcceptedCounter;

    @Inject
    MeterRegistry meterRegistry;

    @Inject
    public RedisRateLimiter(RedisDataSource redis) {
        this.zset = redis.sortedSet(String.class);
        this.keys = redis.key();
    }

    @PostConstruct
    void initMetrics() {
        rateLimitExceededCounter = meterRegistry.counter("rate_limit_exceeded");
        rateLimitAcceptedCounter = meterRegistry.counter("rate_limit_accepted");
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
            rateLimitExceededCounter.increment();
            LOG.warnf(
                    "rate_limit_exceeded key=%s limit=%d windowSeconds=%d",
                    key,
                    max,
                    window.getSeconds()
            );
            throw new InvalidAppointmentException(message);
        }

        String value = now + "-" + UUID.randomUUID();

        zset.zadd(key, now, value);

        rateLimitAcceptedCounter.increment();

        LOG.infof(
                "rate_limit_incremented key=%s count=%d limit=%d",
                key,
                count + 1,
                max
        );

        keys.expire(key, window.getSeconds());
    }

    // =========================
    // CREATE LIMIT (más restrictivo)
    // =========================

    public void checkCreateLimit(String ip, String email) {
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

    public void checkImportLimit(Long barbershopId) {

        checkLimit(
                "rl:import:minute:" + barbershopId,
                5,
                Duration.ofMinutes(1),
                "Too many imports"
        );

        checkLimit(
                "rl:import:day:" + barbershopId,
                50,
                Duration.ofDays(1),
                "Daily import limit reached"
        );
    }
}
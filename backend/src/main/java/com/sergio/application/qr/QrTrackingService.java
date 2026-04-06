package com.sergio.application.qr;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class QrTrackingService {

    private static final String SCANS_PREFIX = "qr:scans:";
    private static final String CONVERSIONS_PREFIX = "qr:conversions:";

    @Inject
    RedisDataSource redis;

    // =========================
    // SCANS
    // =========================

    public void incrementScan(String slug) {
        increment(SCANS_PREFIX + slug);
    }

    public int getScans(String slug) {
        return get(SCANS_PREFIX + slug);
    }

    // =========================
    // CONVERSIONS
    // =========================

    public void incrementConversion(String slug) {
        increment(CONVERSIONS_PREFIX + slug);
    }

    public int getConversions(String slug) {
        return get(CONVERSIONS_PREFIX + slug);
    }

    // =========================
    // INTERNAL HELPERS (PRO)
    // =========================

    private void increment(String key) {
        ValueCommands<String, String> commands = redis.value(String.class);

        String current = commands.get(key);

        int count = current != null ? Integer.parseInt(current) : 0;

        commands.set(key, String.valueOf(count + 1));
    }

    private int get(String key) {
        ValueCommands<String, String> commands = redis.value(String.class);

        String value = commands.get(key);

        return value != null ? Integer.parseInt(value) : 0;
    }
}
package com.sergio.application.qr;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class QrTrackingService {

    private static final String SCANS_PREFIX = "qr:scans:";
    private static final String CONVERSIONS_PREFIX = "qr:conversions:";

    private static final Logger LOG = Logger.getLogger(QrTrackingService.class);

    private Counter qrScansCounter;
    private Counter qrConversionsCounter;

    @Inject
    RedisDataSource redis;

    @Inject
    MeterRegistry meterRegistry;

    @PostConstruct
    void initMetrics() {
        qrScansCounter = meterRegistry.counter("qr_scans");
        qrConversionsCounter = meterRegistry.counter("qr_conversions");
    }

    // =========================
    // SCANS
    // =========================

    public void incrementScan(String slug) {
        qrScansCounter.increment();

        LOG.infof(
                "qr_scan_incremented slug=%s",
                slug
        );
        increment(SCANS_PREFIX + slug);
    }

    public int getScans(String slug) {
        return get(SCANS_PREFIX + slug);
    }

    // =========================
    // CONVERSIONS
    // =========================

    public void incrementConversion(String slug) {
        qrConversionsCounter.increment();

        LOG.infof(
                "qr_conversion_incremented slug=%s",
                slug
        );
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
        commands.incr(key);
    }

    private int get(String key) {
        ValueCommands<String, String> commands = redis.value(String.class);

        String value = commands.get(key);

        return value != null ? Integer.parseInt(value) : 0;
    }
}
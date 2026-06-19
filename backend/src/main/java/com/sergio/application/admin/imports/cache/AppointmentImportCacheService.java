package com.sergio.application.admin.imports.cache;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Duration;
import java.util.Optional;

@ApplicationScoped
public class AppointmentImportCacheService {

    private static final Duration TTL = Duration.ofDays(1);

    private final ValueCommands<String, String> values;

    public AppointmentImportCacheService(RedisDataSource redis) {
        this.values = redis.value(String.class);
    }

    public Optional<String> findByHash(String hash) {
        String value = values.get(buildKey(hash));
        return Optional.ofNullable(value);
    }

    public void save(String hash, String response) {
        values.setex(buildKey(hash), TTL.getSeconds(), response);
    }

    private String buildKey(String hash) {
        return "import:image:" + hash;
    }
}
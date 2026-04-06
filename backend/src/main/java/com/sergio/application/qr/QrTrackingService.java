package com.sergio.application.qr;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class QrTrackingService {

    private static final String PREFIX = "qr:scans:";

    @Inject
    RedisDataSource redis;

    public void increment(String slug) {
        ValueCommands<String, String> commands = redis.value(String.class);

        String key = PREFIX + slug;

        String current = commands.get(key);

        int count = current != null ? Integer.parseInt(current) : 0;

        commands.set(key, String.valueOf(count + 1));
    }

    public int getCount(String slug) {
        ValueCommands<String, String> commands = redis.value(String.class);

        String value = commands.get(PREFIX + slug);

        return value != null ? Integer.parseInt(value) : 0;
    }
}

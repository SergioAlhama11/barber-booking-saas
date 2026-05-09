package com.sergio.application.auth;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Duration;

@ApplicationScoped
public class RedisService {

    private final ValueCommands<String, String> values;
    private final KeyCommands<String> keys;

    @Inject
    public RedisService(RedisDataSource ds) {
        this.values = ds.value(String.class);
        this.keys = ds.key();
    }

    public void set(String key, String value, Duration ttl) {
        values.setex(key, ttl.getSeconds(), value);
    }

    public String get(String key) {
        return values.get(key);
    }

    public int increment(String key, Duration ttl) {
        Long value = values.incr(key);

        if (value == 1) {
            keys.expire(key, ttl.getSeconds());
        }

        return value.intValue();
    }

    public void delete(String key) {
        keys.del(key);
    }
}

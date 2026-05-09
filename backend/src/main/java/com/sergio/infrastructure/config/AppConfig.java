package com.sergio.infrastructure.config;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class AppConfig {

    @ConfigProperty(name = "app.frontend.url")
    String frontendUrl;

    @ConfigProperty(name = "app.env", defaultValue = "dev")
    String env;

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public boolean isProd() {
        return "prod".equalsIgnoreCase(env);
    }
}

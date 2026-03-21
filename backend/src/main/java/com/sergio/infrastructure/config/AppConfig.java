package com.sergio.infrastructure.config;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class AppConfig {

    @ConfigProperty(name = "app.frontend.url")
    String frontendUrl;

    public String getFrontendUrl() {
        return frontendUrl;
    }
}

package com.sergio.infrastructure.config;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class AppConfig {

    @ConfigProperty(name = "app.frontend.url")
    String frontendUrl;

    @ConfigProperty(name = "app.backend.url")
    String backendUrl;

    @ConfigProperty(name = "app.email.enabled", defaultValue = "false")
    boolean emailEnabled;

    @ConfigProperty(name = "app.cookies.secure", defaultValue = "false")
    boolean secureCookies;

    @ConfigProperty(name = "admin.seed.email")
    String adminSeedEmail;

    @ConfigProperty(name = "admin.seed.password")
    String adminSeedPassword;

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public String getBackendUrl() {
        return backendUrl;
    }

    public boolean isEmailEnabled() {
        return emailEnabled;
    }

    public boolean isSecureCookies() {
        return secureCookies;
    }

    public String getAdminSeedEmail() {
        return adminSeedEmail;
    }

    public String getAdminSeedPassword() {
        return adminSeedPassword;
    }
}

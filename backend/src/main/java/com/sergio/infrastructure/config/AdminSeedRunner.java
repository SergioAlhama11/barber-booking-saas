package com.sergio.infrastructure.config;

import com.sergio.application.admin.auth.PasswordService;
import com.sergio.domain.admin.AdminRole;
import com.sergio.infrastructure.persistence.adminUser.AdminUserEntity;
import com.sergio.infrastructure.persistence.adminUser.AdminUserRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;

@ApplicationScoped
public class AdminSeedRunner {

    @Inject
    AdminUserRepository adminUserRepository;

    @Inject
    PasswordService passwordService;

    @Inject
    AppConfig appConfig;

    @Transactional
    public void onStart(@Observes StartupEvent event) {

        if (adminUserRepository.findByEmail(appConfig.getAdminSeedEmail()).isPresent()) {
            return;
        }

        AdminUserEntity admin = new AdminUserEntity();

        admin.setEmail(appConfig.getAdminSeedEmail());
        admin.setPasswordHash(passwordService.hash(appConfig.getAdminSeedPassword()));
        admin.setRole(AdminRole.SUPER_ADMIN);
        admin.setBarbershopId(null);
        admin.setBarberId(null);
        admin.setCreatedAt(Instant.now());

        adminUserRepository.persist(admin);
    }
}
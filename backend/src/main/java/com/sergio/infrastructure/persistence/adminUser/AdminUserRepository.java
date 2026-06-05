package com.sergio.infrastructure.persistence.adminUser;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class AdminUserRepository implements PanacheRepository<AdminUserEntity> {

    public Optional<AdminUserEntity> findByEmail(String email) {
        return find("""
            lower(email) = lower(?1)
        """, normalize(email)).firstResultOptional();
    }

    public Optional<AdminUserEntity> findByBarberId(Long barberId) {
        return find("barberId", barberId)
                .firstResultOptional();
    }

    public Optional<AdminUserEntity> findByEmailAndBarbershopId(String email, Long barbershopId) {
        return find("""
            lower(email) = lower(?1)
            and barbershopId = ?2
        """, normalize(email), barbershopId).firstResultOptional();
    }

    private String normalize(String email) {
        return email == null
                ? null
                : email.trim().toLowerCase();
    }
}
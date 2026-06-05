package com.sergio.domain.admin;

import java.time.Instant;

public class AdminUser {

    private Long id;
    private Long barbershopId;
    private Long barberId;
    private String email;
    private String password;
    private String passwordHash;
    private AdminRole role;
    private Instant createdAt;
    private Instant updatedAt;

    public AdminUser() {}

    public AdminUser(
            Long id,
            Long barbershopId,
            Long barberId,
            String email,
            String password,
            String passwordHash,
            AdminRole role,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.barbershopId = barbershopId;
        this.barberId = barberId;
        this.email = email;
        this.password = password;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBarbershopId() {
        return barbershopId;
    }

    public void setBarbershopId(Long barbershopId) {
        this.barbershopId = barbershopId;
    }

    public Long getBarberId() {
        return barberId;
    }

    public void setBarberId(Long barberId) {
        this.barberId = barberId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public AdminRole getRole() {
        return role;
    }

    public void setRole(AdminRole role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
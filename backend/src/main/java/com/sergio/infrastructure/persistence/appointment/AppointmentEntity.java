package com.sergio.infrastructure.persistence.appointment;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class AppointmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "barbershop_id", nullable = false)
    private Long barbershopId;

    @Column(name = "barber_id", nullable = false)
    private Long barberId;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // 🔐 cancelación (token)
    @Column(name = "cancel_token")
    private String cancelToken;

    @Column(name = "cancel_token_expires_at")
    private Instant cancelTokenExpiresAt;

    // 🔥 soft delete
    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "last_resend_at")
    private Instant lastResendAt;

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

    public Long getServiceId() { return serviceId; }

    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getCancelToken() {
        return cancelToken;
    }

    public void setCancelToken(String cancelToken) {
        this.cancelToken = cancelToken;
    }

    public Instant getCancelTokenExpiresAt() {
        return cancelTokenExpiresAt;
    }

    public void setCancelTokenExpiresAt(Instant cancelTokenExpiresAt) {
        this.cancelTokenExpiresAt = cancelTokenExpiresAt;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Instant cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public Instant getLastResendAt() { return lastResendAt; }

    public void setLastResendAt(Instant lastResendAt) { this.lastResendAt = lastResendAt; }

    public boolean isCancelled() {
        return cancelledAt != null;
    }

    public boolean isTokenValid() {
        return cancelToken != null && cancelTokenExpiresAt != null;
    }
}

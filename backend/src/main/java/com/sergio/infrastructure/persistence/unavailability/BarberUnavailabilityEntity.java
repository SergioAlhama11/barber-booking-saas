package com.sergio.infrastructure.persistence.unavailability;

import com.sergio.domain.unavailability.UnavailabilityRecurrence;
import com.sergio.domain.unavailability.UnavailabilityType;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "barber_unavailability")
public class BarberUnavailabilityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "barbershop_id", nullable = false)
    private Long barbershopId;

    @Column(name = "barber_id", nullable = false)
    private Long barberId;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnavailabilityType type;

    @Enumerated(EnumType.STRING)
    private UnavailabilityRecurrence recurrence;

    @Column(name = "recurrence_until")
    private Instant recurrenceUntil;

    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

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

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public UnavailabilityType getType() {
        return type;
    }

    public void setType(UnavailabilityType type) {
        this.type = type;
    }

    public UnavailabilityRecurrence getRecurrence() {
        return recurrence;
    }

    public void setRecurrence(UnavailabilityRecurrence recurrence) {
        this.recurrence = recurrence;
    }

    public Instant getRecurrenceUntil() {
        return recurrenceUntil;
    }

    public void setRecurrenceUntil(Instant recurrenceUntil) {
        this.recurrenceUntil = recurrenceUntil;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

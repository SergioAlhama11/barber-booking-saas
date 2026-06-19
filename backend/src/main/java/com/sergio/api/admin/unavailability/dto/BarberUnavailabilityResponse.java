package com.sergio.api.admin.unavailability.dto;

import com.sergio.domain.unavailability.UnavailabilityRecurrence;
import com.sergio.domain.unavailability.UnavailabilityType;

import java.time.Instant;

public record BarberUnavailabilityResponse(

        Long id,

        Long barberId,

        Instant startTime,

        Instant endTime,

        UnavailabilityType type,

        UnavailabilityRecurrence recurrence,

        Instant recurrenceUntil,

        String reason,

        Instant createdAt

) {
}
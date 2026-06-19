package com.sergio.api.admin.unavailability.dto;

import com.sergio.domain.unavailability.UnavailabilityRecurrence;
import com.sergio.domain.unavailability.UnavailabilityType;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateBarberUnavailabilityRequest(

        @NotNull
        Instant startTime,

        @NotNull
        Instant endTime,

        @NotNull
        UnavailabilityType type,

        UnavailabilityRecurrence recurrence,

        Instant recurrenceUntil,

        String reason

) {}
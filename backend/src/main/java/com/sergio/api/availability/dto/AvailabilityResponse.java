package com.sergio.api.availability.dto;

import java.time.LocalTime;
import java.util.List;

public record AvailabilityResponse(List<LocalTime> slots) {}
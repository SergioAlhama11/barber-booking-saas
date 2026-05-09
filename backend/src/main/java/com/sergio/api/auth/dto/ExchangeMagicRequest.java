package com.sergio.api.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ExchangeMagicRequest(@NotBlank String token) {}

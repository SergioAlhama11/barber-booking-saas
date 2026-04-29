package com.sergio.api.auth.dto;

public record ExchangeMagicResponse(String token, String email, Long appointmentId) {}

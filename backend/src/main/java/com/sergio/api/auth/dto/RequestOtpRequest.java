package com.sergio.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RequestOtpRequest(
        @NotBlank @Email String email,
        @NotBlank String slug
) {}

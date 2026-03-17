package com.sergio.api.barbershop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBarbershopRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 and 100 characters")
        String name,

        @Email(message = "Invalid email")
        @NotBlank(message = "Owner email is required")
        String ownerEmail

) {}

package com.sergio.api.admin.imports.appointment.dto;

import java.util.List;

public record AppointmentImportResult(
        int imported,
        int failed,
        List<String> errors
) {}

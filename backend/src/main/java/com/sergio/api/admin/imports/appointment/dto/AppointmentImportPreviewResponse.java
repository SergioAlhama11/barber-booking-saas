package com.sergio.api.admin.imports.appointment.dto;

import java.util.List;

public record AppointmentImportPreviewResponse(
        List<ImportedAppointmentDto> appointments,
        int total,
        int valid,
        int invalid,
        List<String> warnings
) {}
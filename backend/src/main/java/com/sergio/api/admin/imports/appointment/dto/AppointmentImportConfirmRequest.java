package com.sergio.api.admin.imports.appointment.dto;

import java.util.List;

public record AppointmentImportConfirmRequest(
        Long barbershopId,
        Long barberId,
        Long serviceId,
        List<ImportedAppointmentDto> appointments
) {}
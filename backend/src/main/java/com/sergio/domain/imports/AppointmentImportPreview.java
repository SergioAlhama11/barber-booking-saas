package com.sergio.domain.imports;

import java.util.List;
import java.util.Objects;

public record AppointmentImportPreview(List<ImportedAppointment> appointments) {

    public int total() {
        return appointments.size();
    }

    public int valid() {
        return (int) appointments.stream()
                .filter(ImportedAppointment::valid)
                .count();
    }

    public int invalid() {
        return total() - valid();
    }

    public List<String> warnings() {
        return appointments.stream()
                .map(ImportedAppointment::warning)
                .filter(Objects::nonNull)
                .toList();
    }
}
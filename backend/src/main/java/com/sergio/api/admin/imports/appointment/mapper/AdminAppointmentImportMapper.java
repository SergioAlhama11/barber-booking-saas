package com.sergio.api.admin.imports.appointment.mapper;

import com.sergio.api.admin.imports.appointment.dto.AppointmentImportPreviewResponse;
import com.sergio.api.admin.imports.appointment.dto.ImportedAppointmentDto;
import com.sergio.domain.imports.AppointmentImportPreview;
import com.sergio.domain.imports.ImportedAppointment;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "cdi")
public interface AdminAppointmentImportMapper {

    ImportedAppointmentDto toDto(ImportedAppointment appointment);

    ImportedAppointment toDomain(ImportedAppointmentDto dto);

    List<ImportedAppointmentDto> toDto(List<ImportedAppointment> appointments);

    List<ImportedAppointment> toDomain(List<ImportedAppointmentDto> appointments);

    default AppointmentImportPreviewResponse toResponse(AppointmentImportPreview preview) {
        return new AppointmentImportPreviewResponse(toDto(preview.appointments()),preview.total(), preview.valid(), preview.invalid(), preview.warnings());
    }
}

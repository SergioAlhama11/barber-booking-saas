package com.sergio.application.admin.imports;

import com.sergio.api.admin.imports.appointment.dto.AppointmentImportResult;
import com.sergio.domain.imports.AppointmentImportPreview;
import com.sergio.domain.imports.ImportedAppointment;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;

public interface AppointmentImportService {

    AppointmentImportPreview preview(Long barbershopId, FileUpload file);

    AppointmentImportResult confirm(Long barbershopId, Long barberId, Long serviceId, List<ImportedAppointment> appointments);
}
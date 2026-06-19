package com.sergio.application.admin.imports;

import com.sergio.domain.imports.ImportedAppointment;

import java.io.InputStream;
import java.util.List;

public interface AppointmentDocumentParser {

    boolean supports(String contentType);

    List<ImportedAppointment> parse(Long barbershopId, InputStream file);

}

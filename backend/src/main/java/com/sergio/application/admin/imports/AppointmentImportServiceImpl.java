package com.sergio.application.admin.imports;

import com.sergio.api.admin.imports.appointment.dto.AppointmentImportResult;
import com.sergio.application.appointment.AppointmentService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.imports.AppointmentImportPreview;
import com.sergio.domain.imports.ImportedAppointment;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AppointmentImportServiceImpl implements AppointmentImportService {

    private final AppointmentService appointmentService;
    private final AppointmentDocumentParserResolver parserResolver;
    private final ImportFileValidator importFileValidator;

    private static final Logger LOG = Logger.getLogger(AppointmentImportServiceImpl.class);

    public AppointmentImportServiceImpl(AppointmentService appointmentService, AppointmentDocumentParserResolver parserResolver, ImportFileValidator importFileValidator) {
        this.appointmentService = appointmentService;
        this.parserResolver = parserResolver;
        this.importFileValidator = importFileValidator;
    }

    @Override
    public AppointmentImportPreview preview(Long barbershopId, FileUpload file) {
        importFileValidator.validate(file.contentType(), file.size());

        AppointmentDocumentParser parser = parserResolver.resolve(file.contentType());

        try (InputStream inputStream = Files.newInputStream(file.uploadedFile())) {
            List<ImportedAppointment> extracted = parser.parse(barbershopId, inputStream);
            List<ImportedAppointment> validated =
                    extracted.stream()
                            .map(this::validate)
                            .toList();

            return new AppointmentImportPreview(validated);
        } catch (IOException e) {
            throw new BadRequestException("Unable to read uploaded file");
        }
    }

    @Override
    public AppointmentImportResult confirm(Long barbershopId, Long barberId, Long serviceId, List<ImportedAppointment> appointments) {

        LOG.infof(
                "appointment_import_confirm_requested barbershopId=%d appointments=%d",
                barbershopId,
                appointments.size()
        );

        int imported = 0;

        List<String> errors = new ArrayList<>();

        for (ImportedAppointment importedAppointment : appointments) {
            ImportedAppointment validated = validate(importedAppointment);

            if (!validated.valid()) {
                errors.add(validated.customerName() + ": " + validated.warning());
                continue;
            }

            try {
                Appointment appointment = mapToAppointment(validated, barberId, serviceId);

                appointmentService.importAppointment(barbershopId, appointment);

                imported++;

            } catch (Exception e) {
                LOG.error("appointment_import_failed", e);
                errors.add(validated.customerName() + ": " + e.getMessage());
            }
        }

        LOG.infof(
                "appointment_import_completed imported=%d failed=%d",
                imported,
                errors.size()
        );

        return new AppointmentImportResult(imported, errors.size(), errors);
    }

    private ImportedAppointment validate(ImportedAppointment appointment) {
        List<String> warnings = new ArrayList<>();
        boolean valid = true;

        if (appointment.customerName() == null || appointment.customerName().isBlank()) {
            warnings.add("Falta el nombre");
            valid = false;
        }

        if (appointment.customerEmail() == null || appointment.customerEmail().isBlank()) {
            warnings.add("No se ha detectado el email. La cita se importará sin cliente asociado");
        }

        if (appointment.startTime() == null) {
            warnings.add("No se ha detectado la fecha");
            valid = false;
        } else if (!appointment.startTime().isAfter(Instant.now())) {
            warnings.add("La cita está en el pasado");
            valid = false;
        }

        return new ImportedAppointment(
                appointment.customerName(),
                appointment.customerEmail(),
                appointment.startTime(),
                valid,
                warnings.isEmpty() ? null : String.join(". ", warnings)
        );
    }

    private Appointment mapToAppointment(ImportedAppointment imported, Long barberId, Long serviceId) {
        Appointment appointment = new Appointment();

        appointment.setCustomerName(imported.customerName());
        appointment.setCustomerEmail(imported.customerEmail());
        appointment.setBarberId(barberId);
        appointment.setServiceId(serviceId);
        appointment.setStartTime(imported.startTime());

        return appointment;
    }
}
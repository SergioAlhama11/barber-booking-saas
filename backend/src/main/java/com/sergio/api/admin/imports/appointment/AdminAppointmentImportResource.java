package com.sergio.api.admin.imports.appointment;

import com.sergio.api.admin.imports.appointment.dto.AppointmentImportConfirmRequest;
import com.sergio.api.admin.imports.appointment.dto.AppointmentImportPreviewResponse;
import com.sergio.api.admin.imports.appointment.dto.AppointmentImportResult;
import com.sergio.api.admin.imports.appointment.dto.AppointmentImportUploadRequest;
import com.sergio.api.admin.imports.appointment.mapper.AdminAppointmentImportMapper;
import com.sergio.application.admin.imports.AppointmentImportService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/admin/imports/appointments")
@Produces(MediaType.APPLICATION_JSON)
public class AdminAppointmentImportResource {

    private final AppointmentImportService appointmentImportService;
    private final AdminAppointmentImportMapper mapper;

    public AdminAppointmentImportResource(AppointmentImportService appointmentImportService, AdminAppointmentImportMapper mapper) {
        this.appointmentImportService = appointmentImportService;
        this.mapper = mapper;
    }

    @POST
    @Path("/preview")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public AppointmentImportPreviewResponse preview(@QueryParam("barbershopId") Long barbershopId, AppointmentImportUploadRequest request) {
        if (barbershopId == null) {
            throw new BadRequestException("Barbershop id is required");
        }

        return mapper.toResponse(appointmentImportService.preview(barbershopId, request.file()));
    }

    @POST
    @Path("/confirm")
    public AppointmentImportResult confirm(AppointmentImportConfirmRequest request) {
        if (request.barbershopId() == null) {
            throw new BadRequestException("Barbershop id is required");
        }

        if (request.barberId() == null) {
            throw new BadRequestException("Barber id is required");
        }

        if (request.serviceId() == null) {
            throw new BadRequestException("Service id is required");
        }

        return appointmentImportService.confirm(request.barbershopId(), request.barberId(), request.serviceId(), mapper.toDomain(request.appointments()));
    }
}
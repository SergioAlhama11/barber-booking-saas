package com.sergio.api.admin.imports.appointment.dto;

import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

public record AppointmentImportUploadRequest(
        @RestForm
        @PartType(MediaType.APPLICATION_OCTET_STREAM)
        FileUpload file
) {}

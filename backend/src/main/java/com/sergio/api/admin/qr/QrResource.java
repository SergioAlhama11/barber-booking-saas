package com.sergio.api.admin.qr;

import com.sergio.api.admin.qr.dto.QrPdfResult;
import com.sergio.application.admin.qr.QrService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

@Path("/admin/barbershops/{id}/qr")
public class QrResource {

    private final QrService qrService;

    public QrResource(QrService qrService) {
        this.qrService = qrService;
    }

    @GET
    @Produces("application/pdf")
    public Response downloadQr(@PathParam("id") Long barbershopId) {
        QrPdfResult result = qrService.generateQrPdf(barbershopId);

        return Response.ok(result.pdf())
                .header(
                        "Content-Disposition",
                        "attachment; filename=\"" + result.fileName() + "\""
                ).build();

    }
}
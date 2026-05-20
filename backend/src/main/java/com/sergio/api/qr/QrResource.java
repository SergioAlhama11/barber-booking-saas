package com.sergio.api.qr;

import com.sergio.application.qr.QrPdfService;
import com.sergio.infrastructure.config.AppConfig;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

@Path("/barbershops/{slug}/qr/pdf")
public class QrResource {

    @Inject
    QrPdfService qrPdfService;

    @Inject
    AppConfig appConfig;

    @GET
    @Produces("application/pdf")
    public Response getQr(@PathParam("slug") String slug) {

        String url = appConfig.getBackendUrl() + "/barbershops/" + slug + "/qr";

        byte[] pdf = qrPdfService.generatePdf(slug, url);

        return Response.ok(pdf)
                .header("Content-Disposition", "attachment; filename=\"qr-" + slug + ".pdf\"")
                .build();
    }
}

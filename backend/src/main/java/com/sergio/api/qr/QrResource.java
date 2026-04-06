package com.sergio.api.qr;

import com.sergio.application.qr.QrPdfService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

@Path("/barbershops/{slug}/qr")
public class QrResource {

    @Inject
    QrPdfService qrPdfService;

    @GET
    @Produces("application/pdf")
    public Response getQr(@PathParam("slug") String slug) {

        String url = "http://192.168.18.212:8080/barbershops/" + slug + "/qr";

        byte[] pdf = qrPdfService.generatePdf(slug, url);

        return Response.ok(pdf)
                .header("Content-Disposition", "attachment; filename=\"qr-" + slug + ".pdf\"")
                .build();
    }
}

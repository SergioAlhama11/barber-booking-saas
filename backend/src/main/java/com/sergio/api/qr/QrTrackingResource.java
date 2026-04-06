package com.sergio.api.qr;

import com.sergio.application.qr.QrTrackingService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

import java.util.Map;

@Path("/barbershops/{slug}/qr")
public class QrTrackingResource {

    @Inject
    QrTrackingService trackingService;

    @GET
    public Response track(@PathParam("slug") String slug) {

        trackingService.incrementScan(slug);

        String redirectUrl = "http://192.168.18.212:3000/barbershops/"
                + slug + "?src=qr";

        return Response.status(303)
                .header("Location", redirectUrl)
                .build();
    }

    @GET
    @Path("/stats")
    public Response getStats(@PathParam("slug") String slug) {

        int scans = trackingService.getScans(slug);
        int conversions = trackingService.getConversions(slug);

        double conversionRate = scans > 0
                ? (double) conversions / scans * 100
                : 0;

        return Response.ok(Map.of(
                "scans", scans,
                "conversions", conversions,
                "conversionRate", conversionRate
        )).build();
    }
}
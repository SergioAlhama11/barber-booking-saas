package com.sergio.api.qr;

import com.sergio.application.qr.QrTrackingService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

@Path("/barbershops/{slug}/qr")
public class QrTrackingResource {

    @Inject
    QrTrackingService trackingService;

    @GET
    public Response track(@PathParam("slug") String slug) {

        // 📊 incrementar contador
        trackingService.increment(slug);

        // 🔁 redirigir al booking
        String redirectUrl = "http://192.168.18.212:3000/barbershops/" + slug;

        return Response.status(302)
                .header("Location", redirectUrl)
                .build();
    }

    @GET
    @Path("/stats")
    public int getStats(@PathParam("slug") String slug) {
        return trackingService.getCount(slug);
    }
}

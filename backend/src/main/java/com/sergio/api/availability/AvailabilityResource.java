package com.sergio.api.availability;

import com.sergio.api.availability.dto.AvailabilityResponse;
import com.sergio.application.availability.AvailabilityService;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.time.LocalDate;

@Path("/barbershops/{slug}/availability")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AvailabilityResource {

    @Inject
    AvailabilityService availabilityService;

    @GET
    public AvailabilityResponse getAvailability(
            @PathParam("slug") @NotBlank String slug,
            @QueryParam("serviceId") Long serviceId,
            @QueryParam("barberId") Long barberId,
            @QueryParam("date") String date
    ) {

        if (serviceId == null) {
            throw new BadRequestException("serviceId is required");
        }

        if (date == null || date.isBlank()) {
            throw new BadRequestException("date is required");
        }

        LocalDate localDate;

        try {
            localDate = LocalDate.parse(date);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date format. Expected yyyy-MM-dd");
        }

        return new AvailabilityResponse(availabilityService.getAvailableSlots(slug, serviceId, barberId, localDate));
    }
}

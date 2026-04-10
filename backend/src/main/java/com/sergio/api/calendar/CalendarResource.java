package com.sergio.api.calendar;

import com.sergio.application.appointment.AppointmentService;
import com.sergio.application.calendar.CalendarService;
import com.sergio.domain.appointment.Appointment;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

@Path("/barbershops/{slug}/appointments")
public class CalendarResource {

    @Inject
    CalendarService calendarService;

    @Inject
    AppointmentService appointmentService;

    @GET
    @Path("/{id}/calendar")
    @Produces("text/calendar")
    public Response downloadCalendar(
            @PathParam("slug") String slug,
            @PathParam("id") Long id
    ) {

        Appointment appointment = appointmentService.findById(slug, id);

        String ics = calendarService.generateIcs(appointment);

        return Response.ok(ics)
                .header("Content-Disposition", "attachment; filename=\"appointment-" + id + ".ics\"")
                .build();
    }
}
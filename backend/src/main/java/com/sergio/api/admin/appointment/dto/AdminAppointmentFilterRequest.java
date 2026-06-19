package com.sergio.api.admin.appointment.dto;

import com.sergio.domain.appointment.AppointmentStatusFilter;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.QueryParam;

import java.time.Instant;

public class AdminAppointmentFilterRequest {

    @QueryParam("from")
    public Instant from;

    @QueryParam("to")
    public Instant to;

    @QueryParam("barbershopId")
    public Long barbershopId;

    @QueryParam("barberId")
    public Long barberId;

    @QueryParam("status")
    @DefaultValue("ACTIVE")
    public AppointmentStatusFilter status;

    @Size(max = 100)
    @QueryParam("search")
    public String search;

    @Min(0)
    @DefaultValue("0")
    @QueryParam("page")
    public int page;

    @Min(1)
    @Max(100)
    @QueryParam("size")
    @DefaultValue("20")
    public int size;
}
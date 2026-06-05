package com.sergio.api.admin.appointment.dto;

import com.sergio.domain.appointment.AppointmentStatusFilter;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.QueryParam;

import java.time.Instant;

public class AdminAppointmentFilterRequest {

    @QueryParam("from")
    public Instant from;

    @QueryParam("to")
    public Instant to;

    @QueryParam("barberId")
    public Long barberId;

    @QueryParam("status")
    @DefaultValue("ACTIVE")
    public AppointmentStatusFilter status;

    @QueryParam("search")
    public String search;

    @QueryParam("page")
    @DefaultValue("0")
    public int page;

    @QueryParam("size")
    @DefaultValue("20")
    public int size;
}
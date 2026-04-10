package com.sergio.domain.appointment;

import java.time.Instant;
import java.time.LocalDateTime;

public class Appointment {

    private Long id;
    private Long barbershopId;
    private Long barberId;
    private Long serviceId;
    private String barberName;
    private String serviceName;
    private String customerName;
    private String customerEmail;
    private Instant startTime;
    private Instant endTime;
    private Instant cancelledAt;
    private String source;
    private int calendarVersion;

    public Appointment(Long id, Long barbershopId, Long barberId, Long serviceId, String barberName, String serviceName, String customerName, String customerEmail, Instant startTime, Instant endTime, Instant cancelledAt, String source, int calendarVersion) {
        this.id = id;
        this.barbershopId = barbershopId;
        this.barberId = barberId;
        this.serviceId = serviceId;
        this.barberName = barberName;
        this.serviceName = serviceName;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.startTime = startTime;
        this.endTime = endTime;
        this.cancelledAt = cancelledAt;
        this.source = source;
        this.calendarVersion = calendarVersion;
    }

    public Appointment() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBarbershopId() {
        return barbershopId;
    }

    public void setBarbershopId(Long barbershopId) {
        this.barbershopId = barbershopId;
    }

    public Long getBarberId() {
        return barberId;
    }

    public void setBarberId(Long barberId) {
        this.barberId = barberId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getBarberName() {
        return barberName;
    }

    public void setBarberName(String barberName) {
        this.barberName = barberName;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Instant getCancelledAt() { return  cancelledAt; }

    public void setCancelledAt(Instant cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public int getCalendarVersion() {
        return calendarVersion;
    }

    public void setCalendarVersion(int calendarVersion) {
        this.calendarVersion = calendarVersion;
    }
}

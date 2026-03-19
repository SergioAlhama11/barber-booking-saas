package com.sergio.domain.appointment;

import java.time.LocalDateTime;

public class Appointment {

    private Long id;
    private Long barbershopId;
    private Long barberId;
    private Long serviceId;
    // private String serviceName;
    private String customerName;
    private String customerEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public Appointment(Long id, Long barbershopId, Long barberId, Long serviceId, String customerName, String customerEmail, LocalDateTime startTime, LocalDateTime endTime) {
        this.id = id;
        this.barbershopId = barbershopId;
        this.barberId = barberId;
        this.serviceId = serviceId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.startTime = startTime;
        this.endTime = endTime;
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

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}

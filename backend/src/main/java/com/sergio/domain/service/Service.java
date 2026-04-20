package com.sergio.domain.service;

import java.math.BigDecimal;

public class Service {

    private Long id;
    private Long barbershopId;
    private String name;
    private Integer durationMinutes;
    private BigDecimal price;

    public Service(Long id, Long barbershopId, String name, Integer durationMinutes, BigDecimal price) {
        this.id = id;
        this.barbershopId = barbershopId;
        this.name = name;
        this.durationMinutes = durationMinutes;
        this.price = price;
    }

    public Service() {}

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getBarbershopId() {
        return barbershopId;
    }

    public void setBarbershopId(Long barbershopId) {
        this.barbershopId = barbershopId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}

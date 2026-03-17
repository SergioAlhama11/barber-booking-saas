package com.sergio.domain.barber;

public class Barber {

    private Long id;
    private Long barbershopId;
    private String name;

    public Barber(Long id, Long barbershopId, String name) {
        this.id = id;
        this.barbershopId = barbershopId;
        this.name = name;
    }

    public Barber() {}

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

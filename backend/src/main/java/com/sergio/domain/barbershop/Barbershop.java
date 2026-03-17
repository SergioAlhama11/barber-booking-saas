package com.sergio.domain.barbershop;

public class Barbershop {

    private Long id;
    private String name;
    private String ownerEmail;
    private String slug;

    public Barbershop(Long id, String slug, String name, String ownerEmail) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.ownerEmail = ownerEmail;
    }

    public Barbershop() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }
}

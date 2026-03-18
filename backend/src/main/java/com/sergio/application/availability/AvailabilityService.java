package com.sergio.application.availability;

import com.sergio.application.service.ServiceService;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AvailabilityService {
    private static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);
    private static final int SLOT_INTERVAL_MINUTES = 30;

    @Inject
    BarbershopRepository barbershopRepository;

    @Inject
    AppointmentRepository appointmentRepository;

    @Inject
    BarberRepository barberRepository;

    @Inject
    ServiceService serviceService;

    public List<LocalTime> getAvailableSlots(String slug, Long serviceId, Long barberId, LocalDate date) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        if (date.isBefore(today)) {
            return List.of();
        }

        if (barberId != null && !barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
            throw new NotFoundException("Barber not found in this barbershop");
        }

        int duration = serviceService.findById(slug, serviceId).getDurationMinutes();

        List<LocalTime> slots = new ArrayList<>();

        for (LocalTime current = OPENING_TIME; !current.plusMinutes(duration).isAfter(CLOSING_TIME); current = current.plusMinutes(SLOT_INTERVAL_MINUTES)) {

            LocalDateTime start = LocalDateTime.of(date, current);
            LocalDateTime end = start.plusMinutes(duration);

            if (date.equals(today) && !start.isAfter(now)) {
                continue;
            }

            boolean overlap = (barberId != null)
                    ? appointmentRepository.existsOverlapping(barberId, start, end)
                    : appointmentRepository.existsOverlappingAnyBarber(barbershopId, start, end);

            if (!overlap) {
                slots.add(current);
            }
        }

        return slots;
    }

    private Long getBarbershopIdOrThrow(String slug) {
        BarbershopEntity barbershop = barbershopRepository.find("slug", slug).firstResult();

        if (barbershop == null) {
            throw new NotFoundException("Barbershop not found");
        }

        return barbershop.getId();
    }
}

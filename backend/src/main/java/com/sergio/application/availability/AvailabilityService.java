package com.sergio.application.availability;

import com.sergio.application.service.ServiceService;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AvailabilityService {
    private static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);
    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final int BOOKING_BUFFER_MINUTES = 5;

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

        ZoneId zone = ZoneId.of("Europe/Madrid");
        LocalDate today = LocalDate.now(zone);
        LocalDateTime now = LocalDateTime.now(zone);

        // ❌ no permitir fechas pasadas
        if (date.isBefore(today)) {
            return List.of();
        }

        // ❌ validar barber
        if (barberId != null && !barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
            throw new NotFoundException("Barber not found in this barbershop");
        }

        // ⏱ duración del servicio
        int duration = serviceService.findById(slug, serviceId).getDurationMinutes();

        List<LocalTime> slots = new ArrayList<>();

        for (LocalTime current = OPENING_TIME;
             !current.plusMinutes(duration).isAfter(CLOSING_TIME);
             current = current.plusMinutes(SLOT_INTERVAL_MINUTES)) {

            LocalDateTime start = LocalDateTime.of(date, current);
            LocalDateTime end = start.plusMinutes(duration);

            // ❌ evitar slots en pasado (con buffer)
            if (date.equals(today) && start.isBefore(now.plusMinutes(BOOKING_BUFFER_MINUTES))) {
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

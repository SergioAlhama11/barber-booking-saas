package com.sergio.application.scheduling;

import com.sergio.application.service.ServiceService;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static com.sergio.application.scheduling.SchedulingConstants.*;

@ApplicationScoped
public class AvailabilityService {

    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final int BOOKING_BUFFER_MINUTES = 5;

    private Counter availabilityRequestsCounter;
    private Counter availabilityEmptyCounter;

    private Timer availabilityTimer;

    private final BarbershopLookupService barbershopLookupService;
    private final ServiceService serviceService;
    private final AppointmentRepository appointmentRepository;
    private final BarberRepository barberRepository;
    private final UnavailabilityService unavailabilityService;
    private final MeterRegistry meterRegistry;

    public AvailabilityService(
            BarbershopLookupService barbershopLookupService,
            ServiceService serviceService,
            AppointmentRepository appointmentRepository,
            BarberRepository barberRepository,
            UnavailabilityService unavailabilityService,
            MeterRegistry meterRegistry
    ) {
        this.barbershopLookupService = barbershopLookupService;
        this.serviceService = serviceService;
        this.appointmentRepository = appointmentRepository;
        this.barberRepository = barberRepository;
        this.unavailabilityService = unavailabilityService;
        this.meterRegistry = meterRegistry;
    }

    @PostConstruct
    void initMetrics() {
        availabilityRequestsCounter = meterRegistry.counter("availability_requests");
        availabilityEmptyCounter = meterRegistry.counter("availability_empty_results");
        availabilityTimer = meterRegistry.timer("availability_duration");
    }

    public List<LocalTime> getAvailableSlots(String slug, Long serviceId, Long barberId, LocalDate date) {
        return availabilityTimer.record(() -> {
            availabilityRequestsCounter.increment();

            Long barbershopId = barbershopLookupService.getIdOrThrow(slug);

            LocalDate today = LocalDate.now(ZONE);
            LocalDateTime now = LocalDateTime.now(ZONE);

            if (date.isBefore(today)) {
                return List.of();
            }

            if (barberId != null && !barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
                throw new NotFoundException("Barber not found in this barbershop");
            }

            int durationMinutes = serviceService.findById(slug, serviceId).getDurationMinutes();

            List<LocalTime> slots = new ArrayList<>();

            for (LocalTime current = OPENING_TIME;
                 !current.plusMinutes(durationMinutes).isAfter(CLOSING_TIME);
                 current = current.plusMinutes(SLOT_INTERVAL_MINUTES)) {

                LocalDateTime start = LocalDateTime.of(date, current);
                LocalDateTime end = start.plusMinutes(durationMinutes);

                if (date.equals(today) && start.isBefore(now.plusMinutes(BOOKING_BUFFER_MINUTES))) {
                    continue;
                }

                Instant startInstant = start.atZone(ZONE).toInstant();
                Instant endInstant = end.atZone(ZONE).toInstant();

                if (isSlotAvailable(barbershopId, barberId, startInstant, endInstant)) {
                    slots.add(current);
                }
            }

            if (slots.isEmpty()) {
                availabilityEmptyCounter.increment();
            }

            return slots;
        });
    }

    private boolean isSlotAvailable(Long barbershopId, Long barberId, Instant start, Instant end) {
        boolean occupied;

        if (barberId != null) {
            occupied = appointmentRepository.existsOverlapping(barberId, start, end);

            if (occupied) {
                return false;
            }

            return !unavailabilityService.isUnavailable(barberId, start, end);
        }

        return !appointmentRepository.existsOverlappingAnyBarber(barbershopId, start, end);
    }
}
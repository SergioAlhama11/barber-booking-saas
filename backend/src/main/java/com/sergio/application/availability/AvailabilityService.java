package com.sergio.application.availability;

import com.sergio.application.service.ServiceService;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.jboss.logging.Logger;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AvailabilityService {

    private static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);
    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final int BOOKING_BUFFER_MINUTES = 5;

    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");

    private static final Logger LOG = Logger.getLogger(AvailabilityService.class);

    private Counter availabilityRequestsCounter;
    private Counter availabilityEmptyCounter;

    private Timer availabilityTimer;

    @Inject
    BarbershopRepository barbershopRepository;

    @Inject
    AppointmentRepository appointmentRepository;

    @Inject
    BarberRepository barberRepository;

    @Inject
    ServiceService serviceService;

    @Inject
    MeterRegistry meterRegistry;

    @PostConstruct
    void initMetrics() {
        availabilityRequestsCounter = meterRegistry.counter("availability_requests");
        availabilityEmptyCounter = meterRegistry.counter("availability_empty_results");

        availabilityTimer = meterRegistry.timer("availability_duration");
    }

    public List<LocalTime> getAvailableSlots(
            String slug,
            Long serviceId,
            Long barberId,
            LocalDate date
    ) {

        return availabilityTimer.record(() -> {
            availabilityRequestsCounter.increment();
            LOG.infof(
                    "availability_requested slug=%s barberId=%s serviceId=%s date=%s",
                    slug,
                    barberId,
                    serviceId,
                    date
            );

            Long barbershopId = getBarbershopIdOrThrow(slug);

            LocalDate today = LocalDate.now(ZONE);
            LocalDateTime now = LocalDateTime.now(ZONE);

            // ❌ no permitir fechas pasadas
            if (date.isBefore(today)) {
                LOG.warnf(
                        "availability_past_date_requested slug=%s date=%s",
                        slug,
                        date
                );
                return List.of();
            }

            // ❌ validar barber
            if (barberId != null &&
                    !barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
                LOG.warnf(
                        "availability_invalid_barber slug=%s barberId=%d",
                        slug,
                        barberId
                );
                throw new NotFoundException("Barber not found in this barbershop");
            }

            // ⏱ duración del servicio
            int durationMinutes = serviceService.findById(slug, serviceId).getDurationMinutes();

            List<LocalTime> slots = new ArrayList<>();

            for (LocalTime current = OPENING_TIME;
                 !current.plusMinutes(durationMinutes).isAfter(CLOSING_TIME);
                 current = current.plusMinutes(SLOT_INTERVAL_MINUTES)) {

                LocalDateTime start = LocalDateTime.of(date, current);
                LocalDateTime end = start.plusMinutes(durationMinutes);

                // ❌ evitar slots en pasado (con buffer)
                if (date.equals(today) &&
                        start.isBefore(now.plusMinutes(BOOKING_BUFFER_MINUTES))) {
                    continue;
                }

                // 🔥 CONVERSIÓN CLAVE A INSTANT
                Instant startInstant = start.atZone(ZONE).toInstant();
                Instant endInstant = end.atZone(ZONE).toInstant();

                boolean overlap = (barberId != null)
                        ? appointmentRepository.existsOverlapping(barberId, startInstant, endInstant)
                        : appointmentRepository.existsOverlappingAnyBarber(barbershopId, startInstant, endInstant);

                if (!overlap) {
                    slots.add(current);
                }
            }

            LOG.infof(
                    "availability_resolved slug=%s barberId=%s serviceId=%s date=%s slots=%d",
                    slug,
                    barberId,
                    serviceId,
                    date,
                    slots.size()
            );

            if (slots.isEmpty()) {
                availabilityEmptyCounter.increment();
            }

            return slots;
        });
    }

    private Long getBarbershopIdOrThrow(String slug) {
        return barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }
}